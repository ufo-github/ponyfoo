'use strict';

var contra = require('contra');
var winston = require('winston');
var Article = require('../../../models/Article');
var articleSharingService = require('../../../services/articleSharing');
var articlePublishService = require('../../../services/articlePublish');
var respond = require('../lib/respond');
var validate = require('./lib/validate');

module.exports = function (req, res, next) {
  var validation = validate(req.body, true);
  if (validation.length) {
    respond.invalid(res, validation); return;
  }
  var model = validation.model;

  contra.waterfall([
    function lookup (next) {
      Article.findOne({ slug: req.params.slug }, next);
    },
    function found (article, next) {
      if (!article) {
        res.status(404).json({ messages: ['Article not found'] }); return;
      }
      model._id = article._id;
      articlePublishService.publish(model, maybePublished);
      function maybePublished (err, published) {
        next(err, article, published);
      }
    },
    function statusUpdate (article, published, next) {
      Object.keys(model).forEach(updateModel);
      article.save(saved);

      function updateModel (key) {
        article[key] = model[key];
      }
      function saved (err) {
        if (!err && published) {
          articleSharingService.share(article);
        }
        next(err);
      }
    }
  ], function response (err) {
    if (err) {
      winston.error(err);
    }
    respond(err, res, next, validation);
  });
};
