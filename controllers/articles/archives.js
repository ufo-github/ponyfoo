'use strict';

var _ = require('lodash');
var articleService = require('../../services/article');

module.exports = function (req, res, next) {
  var query = { status: 'published' };

  articleService.find(query, function (err, articles) {
    if (err) {
      next(err); return;
    }
    var expanded = articles.map(articleService.toJSON);
    res.viewModel = {
      model: {
        title: 'Archives',
        articles: expanded,
        total: _.pluck(expanded, 'readingTime').reduce(sum, 0)
      }
    };
    next();
  });

  function sum (accumulator, value) {
    return accumulator + value;
  }
};
