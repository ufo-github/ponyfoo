'use strict';

var articleService = require('../../services/article');
var toJSON = require('./lib/toJSON');

module.exports = function (req, res, next) {
  var query = { status: 'published' };

  articleService.find(query, function (err, articles) {
    if (err) {
      next(err); return;
    }
    res.viewModel = {
      model: {
        title: 'Archives',
        articles: articles.map(toJSON)
      }
    };
    next();
  });
};
