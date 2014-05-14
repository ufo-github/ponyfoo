'use strict';

var taunus = require('taunus');
var routes = require('./routes');
var articleList = require('./article/list');
var errors = require('../lib/errors');

module.exports = function (app) {
  app.get('/api/articles', articleList);

  taunus.mount(app, routes);
  app.use(errors.handler);
};
