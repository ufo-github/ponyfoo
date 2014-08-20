'use strict';

var contra = require('contra');
var Article = require('../../../models/Article');

module.exports = function (req, res, next) {
  var query = { slug: req.params.slug };

  contra.waterfall([
    function lookupArticle (next) {
      Article.findOne(query).populate('prev next').exec(next);
    },
    function found (article, next) {
      if (!article) {
        res.json(404, { messages: ['Article not found'] }); return;
      }
      contra.concurrent([
        function (next) {
          article.remove(next);
        },
        function (next) {
          if (!article.prev) {
            next(); return;
          }
          article.prev.next = article.next;
          article.prev.save(function saved (err) {
            next(err);
          });
        },
        function (next) {
          if (!article.next) {
            next(); return;
          }
          article.next.prev = article.prev;
          article.next.save(function saved (err) {
            next(err);
          });
        }
      ], next);
    }
  ], handle);

  function handle (err) {
    if (err) {
      next(err); return;
    }
    res.json(200, {});
  }
};
