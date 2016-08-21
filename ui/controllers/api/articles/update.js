'use strict';

const contra = require(`contra`);
const winston = require(`winston`);
const Article = require(`../../../models/Article`);
const articleSubscriberService = require(`../../../services/articleSubscriber`);
const articlePublishService = require(`../../../services/articlePublish`);
const userService = require(`../../../services/user`);
const respond = require(`../lib/respond`);
const validate = require(`./lib/validate`);
const editorRoles = [`owner`, `editor`];

module.exports = function (req, res, next) {
  const editor = userService.hasRole(req.userObject, editorRoles);
  const { authorSlug } = req.body;
  const hasAuthor = !!authorSlug;

  contra.waterfall([lookup, found], response);

  function lookup (next) {
    const articleQuery = { slug: req.params.slug };
    if (!editor) {
      articleQuery.author = req.user;
    }
    const userQuery = { slug: authorSlug };
    contra.concurrent({
      article: next => Article.findOne(articleQuery).populate(`author`).exec(next),
      author: next => {
        if (!hasAuthor) {
          next(null); return;
        }
        userService.findUserWithRole(userQuery, [`owner`, `articles`], next);
      }
    }, next);
  }

  function found ({ article, author }, next) {
    if (!article) {
      res.status(404).json({ messages: [`Article not found`] }); return;
    }
    const { body } = req;
    if (body.status !== `draft` && !editor) {
      respond.invalid(res, [`Authors are only allowed to write drafts. An editor must publish the article.`]); return;
    }
    const originalAuthor = article.author.equals(req.user);
    const validation = validate(body, {
      update: true,
      editor,
      originalAuthor,
      author,
      hasAuthor
    });
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
