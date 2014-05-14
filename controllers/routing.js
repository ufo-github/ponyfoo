'use strict';

var taunus = require('taunus');
var routes = require('./routes');
var article = require('./article');
var errors = require('../lib/errors');
var defaults = {
  description: '',
  author: {
    meta: 'Nicolas Bevacqua <foo@bevacqua.io>',
    twitter: '@nzgb'
  },
  images: {
    cover: '',
    list: []
  },
  partial: 'error/not-found',
  model: {
    title: 'Pony Foo'
  }
};

module.exports = function (app) {
  app.get('/api/articles', article.list);

  taunus.mount(app, routes, {
    defaults: defaults,
    views: '.bin/views'
  });
  app.use(errors.handler);
};
