'use strict';

var jade = require('jade/runtime');
var taunus = require('taunus');
var routes = require('./routes');
var markdownImageUpload = require('./api/markdown/images');
var articleList = require('./api/article/list');
var errors = require('../lib/errors');

global.jade = jade; // let jade have it their way

module.exports = function (app) {
  app.put('/api/markdown/images', markdownImageUpload);
  app.get('/api/articles', articleList);

  taunus.mount(app, routes);
  app.use(errors.handler);
};
