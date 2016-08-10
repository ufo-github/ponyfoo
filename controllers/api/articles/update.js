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

  contra.waterfall([lookup, found], response);

  function lookup (next) {
    const query = { slug: req.params.slug };
    if (!editor) {
      query.author = req.user;
    }
    Article.findOne(query).populate('author').exec(next);
  }

  function found (article, next) {
    if (!article) {
      res.status(404).json({ messages: ['Article not found'] }); return;
    }
    const body = req.body;
    if (body.status !== 'draft' && !editor) {
      respond.invalid(res, ['Authors are only allowed to write drafts. An editor must publish the article.']); return;
    }
    const validation = validate(body, { update: true, editor: editor, originalAuthor: article.author.equals(req.user) });
    if (validation.length) {
      respond.invalid(res, validation); return;
    }
    const model = validation.model;

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
