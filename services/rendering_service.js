'use strict';

var _ = require('lodash');
var path = require('path');
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

module.exports = {
  respond: function (req, res, next) {
    var vm = res.viewModel;
    var accept = req.headers.accept || '';
    var data = _.extend({}, defaults, vm);
    var template;

    if (!data) {
      next();
    } else if (~accept.indexOf('html')) {
      template = path.join('../.bin/views', data.partial);
      data.partial = require(template)(data.model);
      res.render('__layout', data);
    } else if (~accept.indexOf('json')) {
      res.json(data);
    } else {
      next();
    }
  }
};
