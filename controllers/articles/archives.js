'use strict';

var articleService = require('../../services/article');

module.exports = function (req, res, next) {
  var query = { status: 'published' };

  articleService.find(query, function (err, articles) {
    if (err) {
      next(err); return;
    }
    res.viewModel = {
      model: {
        title: 'Archives',
        articles: articles.map(articleService.toJSON)
      }
    };
    next();
  });
};
