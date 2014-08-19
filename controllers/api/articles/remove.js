'use strict';

var contra = require('contra');
var Article = require('../../../models/Article');

module.exports = function (req, res, next) {
  var query = { _id: req.params.id };

  contra.waterfall([
    function lookupArticle (next) {
      Article.findOne(query, next);
    },
    function handle (article, next) {
      if (!article) {
        res.json(404, { messages: ['Article not found'] }); return;
      }
      article.remove(next);
    }
  ], handle);

  function handle (err) {
    if (err) {
      next(err); return;
    }
    res.json(200, {});
  }
};
