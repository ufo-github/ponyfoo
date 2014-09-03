'use strict';

var _ = require('lodash');
var contra = require('contra');
var Article = require('../../models/Article');
var Comment = require('../../models/Comment');

module.exports = function (req, res, next) {
  var model = validate(req);

  contra.waterfall([findArticle, decisionTree, create], respond);

  function findArticle (next) {
    Article.findOne(req.params.slug).populate('comments').exec(next);
  }

  function decisionTree (article, next) {
    if (!article) {
      res.json(404, { messages: ['Article not found'] }); return;
    }
    next(null, article);
  }

  function create (article, next) {
    var parent;
    if (model.parent) {
      var parent = _.find(article.comments, { _id: model.parent });
      if (parent.parent) {
        res.json(400, { messages: ['Comments can\'t be nested that deep!'] }); return;
      }
    }
    article.comments.push(model);
    article.save(saved);

    function saved (err) {
      next(err);
    }
  }

  function respond (err) {
    if (err) {
      next(err); return;
    }
  }
};
