'use strict';

var contra = require('contra');
var winston = require('winston');
var Article = require('../../../models/Article');
var articleSubscriberService = require('../../../services/articleSubscriber');
var articlePublishService = require('../../../services/articlePublish');
var userService = require('../../../services/user');
var respond = require('../lib/respond');
var validate = require('./lib/validate');
var editorRoles = ['owner', 'editor'];

module.exports = function (req, res, next) {
  var editor = userService.hasRole(req.userObject, editorRoles);

  contra.waterfall([lookup, found], response);

  function lookup (next) {
    var query = { slug: req.params.slug };
    if (!editor) {
      query.author = req.user;
    }
    Article.findOne(query).populate('author').exec(next);
  }

  function found (article, next) {
    if (!article) {
      res.status(404).json({ messages: ['Article not found'] }); return;
    }
    var body = req.body;
    if (body.status !== 'draft' && !editor) {
      respond.invalid(res, ['Authors are only allowed to write drafts. An editor must publish the article.']); return;
    }
    var validation = validate(body, { update: true, editor: editor, originalAuthor: article.author.equals(req.user) });
    if (validation.length) {
      respond.invalid(res, validation); return;
    }
    var model = validation.model;

    model._id = article._id;
    articlePublishService.publish(model, maybePublished);

    function maybePublished (err, published) {
      if (err) {
        next(err); return;
      }
      statusUpdate(published);
    }

    function statusUpdate (published) {
      Object.keys(model).forEach(updateModel);
      article.save(saved);

      function updateModel (key) {
        article[key] = model[key];
      }
      function saved (err) {
        if (!err && published) {
          articleSubscriberService.share(article);
        }
        next(err);
      }
    }
  }

  function response (err) {
    if (err) {
      winston.error(err);
    }
    respond(err, res, next);
  }
};
