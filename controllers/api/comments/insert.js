'use strict';

var _ = require('lodash');
var contra = require('contra');
var Article = require('../../../models/Article');
var Comment = require('../../../models/Comment');
var validate = require('./lib/validate');
var respond = require('../lib/respond');
var markdownService = require('../../../services/markdown');

module.exports = function (req, res, next) {
  var body = req.body;
  var validation = validate(body);
  if (validation.length) {
    res.json(400, { messages: validation }); return;
  }
  var model = validation.model;

  contra.waterfall([findArticle, decisionTree, create], response);

  function findArticle (next) {
    Article.findOne({ slug: req.params.slug }).populate('comments').exec(next);
  }

  function decisionTree (article, next) {
    if (!article) {
      res.json(404, { messages: ['Article not found'] }); return;
    }
    next(null, article);
  }

  function create (article, next) {
    var parentId = model.parent;
    var parent;
    if (parentId) {
      parent = _.find(article.comments, { _id: parentId });
      if (parent.parent) {
        res.json(400, { messages: ['Comments can\'t be nested that deep!'] }); return;
      }
    }
    model.contentHtml = markdownService.compile(model.content);
    article.comments.push(model);
    article.save(saved);

    function saved (err) {
      next(err);
    }
  }

  function response (err) {
    respond(err, res, next, validation);
  }
};
