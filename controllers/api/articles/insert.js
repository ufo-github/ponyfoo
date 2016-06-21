'use strict';

var contra = require('contra');
var Article = require('../../../models/Article');
var articleSharingService = require('../../../services/articleSharing');
var articlePublishService = require('../../../services/articlePublish');
var userService = require('../../../services/user');
var respond = require('../lib/respond');
var validate = require('./lib/validate');
var editorRoles = ['owner', 'editor'];

module.exports = function (req, res, next) {
  var editor = userService.hasRole(req.userObject, editorRoles);
  var body = req.body;
  if (body.status !== 'draft' && !editor) {
    respond.invalid(res, ['Authors are only allowed to write drafts. An editor must publish the article.']); return;
  }
  var validation = validate(body);
  if (validation.length) {
    respond.invalid(res, validation); return;
  }
  var model = new Article(validation.model);

  contra.waterfall([
    function lookupSlug (next) {
      Article.findOne({ slug: model.slug }, next);
    },
    function validateSlug (article, next) {
      if (article) {
        validation.push('The slug you provided is already in use. Please change it.');
      }
      next(validation.length);
    },
    function statusUpdate (next) {
      articlePublishService.publish(model, next);
    },
    function insert (published, next) {
      model.author = req.user;
      model.save(saved);

      function saved (err) {
        if (!err && published) {
          articleSharingService.share(model);
        }
        next(err);
      }
    }
  ], function response (err) {
    respond(err, res, next, validation);
  });
};
