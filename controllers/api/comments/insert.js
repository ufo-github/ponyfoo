'use strict';

var _ = require('lodash');
var contra = require('contra');
var Article = require('../../../models/Article');
var Comment = require('../../../models/Comment');
var User = require('../../../models/User');
var validate = require('./lib/validate');
var respond = require('../lib/respond');
var markdownFatService = require('../../../services/markdownFat');
var subscriberService = require('../../../services/subscriber');

module.exports = function (req, res, next) {
  var body = req.body;
  var validation = validate(body);
  if (validation.length) {
    res.status(400).json({ messages: validation }); return;
  }
  var model = validation.model;

  contra.waterfall([findArticle, decisionTree, create], response);

  function findArticle (next) {
    Article.findOne({ slug: req.params.slug }).populate('comments').exec(next);
  }

  function decisionTree (article, next) {
    if (!article) {
      res.status(404).json({ messages: ['Article not found'] }); return;
    }
    next(null, article);
  }

  function create (article, next) {
    var parent;
    var parentId = model.parent;
    if (parentId) {
      parent = article.comments.id(parentId);
      if (!parent) {
        res.status(404).json({ messages: ['The comment thread has been deleted!'] }); return;
      }
      if (parent.parent) {
        res.status(400).json({ messages: ['Comments can\'t be nested that deep!'] }); return;
      }
    }
    model.contentHtml = markdownFatService.compileExternalizeLinks(model.content);
    article.comments.push(model);
    article.save(saved);

    function saved (err) {
      if (!err) {
        subscriberService.add(model.email);
        notify(article);
      }
      next(err);
    }
  }

  function getRecipients (article) {
    var emails = [article.author.email];
    var thread, op;
    var parentId = model.parent;
    if (parentId) {
      op = article.comments.id(parentId);
      thread = article.comments.filter(sameThread);
      thread.unshift(op);
      emails = emails.concat(_.pluck(thread, 'email'));
    }
    function sameThread (comment) {
      return comment.parent && comment.parent.equals(parentId);
    }
    return _(emails).uniq().without(model.email).value();
  }

  function notify (article) {
    contra.waterfall([
      function (next) {
        article.populate('author', next);
      },
      function (article, next) {
        var emails = getRecipients(article);
        console.log(emails);
      }
    ]);
  }

  function response (err) {
    respond(err, res, next, validation);
  }
};
