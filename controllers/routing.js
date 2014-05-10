'use strict';

var article = require('./article_controller');

module.exports = function (app) {
  app.get('/api/articles', article.getList);
};
