'use strict';

var taunus = require('taunus');
var routes = require('./routes');
var markdownImageUpload = require('./api/markdown/images');
var articleList = require('./article/list');
var errors = require('../lib/errors');

module.exports = function (app) {
  app.put('/api/markdown/images', markdownImageUpload);
  app.get('/api/articles', articleList);

  taunus.mount(app, routes);
  app.use(errors.handler);
};
