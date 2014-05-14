'use strict';

var taunus = require('taunus');
var routes = require('./routes');
var article = require('./article');
var errors = require('../lib/errors');

module.exports = function (app) {
  app.get('/api/articles', article.list);

  taunus.mount(app, routes);
  app.use(errors.handler);
};
