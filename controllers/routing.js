'use strict';

var article = require('./article_controller');
var home = require('./home_controller');
var author = require('./author_controller');
var view = require('./view_controller');
var errors = require('../lib/errors');

module.exports = function (app) {
  app.get('/api/articles', article.list);

  app.get('/', home.index);
  app.get('/author/compose', author.only, author.compose);
  app.get('/*', view.render);

  app.use(errors.handler);
};
