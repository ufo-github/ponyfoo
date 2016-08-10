'use strict';

const contra = require('contra');
const winston = require('winston');
const Article = require('../../../models/Article');
const articleSubscriberService = require('../../../services/articleSubscriber');
const articlePublishService = require('../../../services/articlePublish');
const userService = require('../../../services/user');
const respond = require('../lib/respond');
const validate = require('./lib/validate');
const editorRoles = ['owner', 'editor'];

module.exports = function (req, res, next) {
  const editor = userService.hasRole(req.userObject, editorRoles);
  const body = req.body;
  if (body.status !== 'draft' && !editor) {
    respond.invalid(res, ['Authors are only allowed to write drafts. An editor must publish the article.']); return;
  }
  const validation = validate(body, { update: false, editor: editor, originalAuthor: true });
  if (validation.length) {
    respond.invalid(res, validation); return;
  }
  const model = new Article(validation.model);

  contra.waterfall([
    function lookupSlug (next) {
      Article.findOne({ slug: model.slug }).exec(next);
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
          model.populate('author', populated);
        }
        next(err);
      }
      function populated (err) {
        if (err) {
          winston.warn('Error populating before article can be shared.', err); return;
        }
        articleSubscriberService.share(model);
      }
    }
  ], function response (err) {
    respond(err, res, next, validation);
  });
};
