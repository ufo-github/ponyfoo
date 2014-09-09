'use strict';

var _ = require('lodash');
var contra = require('contra');
var Article = require('../../../models/Article');

function remove (req, res, next) {
  var id = req.params.id;
  var query = [
    { _id: id },
    { parent: req.params.id }
  ];

  contra.waterfall([lookup, found, removal], handle);

  function lookup (next) {
    Article.findOne({ slug: req.params.slug }).populate('comments').exec(next);
  }

  function found (article, next) {
    var comment = article.comments.id(id);
    if (!comment) {
      res.status(404).json({ messages: ['Comment not found'] }); return;
    }
    next(null, article);
  }

  function removal (article, next) {
    var comment = article.comments.id(id);
    var children = article.comments.filter(sameThread);

    function sameThread (comment) {
      return comment.parent && comment.parent.equals(id);
    }

    [comment].concat(children).forEach(function removeAll (comment) {
      comment.remove();
    });

    article.save(saved);

    function saved (err) {
      next(err);
    }
  }

  function handle (err) {
    if (err) {
      next(err); return;
    }
    res.json({});
  }
}

module.exports = remove;
