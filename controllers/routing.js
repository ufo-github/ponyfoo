'use strict';

var article = require('./article_controller');
var view = require('./view_controller');

module.exports = function (app) {
  app.get('/api/articles', article.getList);

  app.get('/*', view.getView);
};
