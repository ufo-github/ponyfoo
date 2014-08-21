'use strict';

var util = require('util');
var articleSearch = require('../../services/articleSearch');

module.exports = function (req, res, next) {
  var terms = req.params.terms;

  articleSearch.query(terms, handle);

  function handle (err, articles) {
    if (err) {
      next(err); return;
    }
    res.viewModel = {
      model: {
        action: 'articles/list',
        title: util.format('Search results for "%s"', terms),
        articles: articles
      }
    };
    next();
  }
};
