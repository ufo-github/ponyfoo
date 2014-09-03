'use strict';

var contra = require('contra');
var Article = require('../../models/Article');
var Comment = require('../../models/Comment');

module.exports = function (req, res, next) {
  var model = validate(req);

  contra.waterfall([findArticle, decisionTree]);

  function findArticle (next) {
    Article.findOne(req.params.slug).populate('comments').exec(next);
  }

  function decisionTree (article, next) {
    if (!article) {
      res.json(404, { messages: ['Article not found'] }); return;
    }
    if (!model.parent) {
      create(article, next);
    } else {
      append(_.find(article.comments, { _id: model.parent }), next);
    }
  }

  function create (article, next) {
    article.comments.push(model);
    article.save(saved);

    function saved (err) {
      next(err);
    }
  }

  function append (comment, next) {
    if (comment.parent) {
      res.json(400, { messages: ['Comments can\'t be nested that deep!'] }); return;
    }
    article.comments.push(model);
    article.save(saved);

    function saved (err) {
      next(err);
    }
  }
};
