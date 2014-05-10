'use strict';

var _ = require('lodash');
var defaults = {
  title: 'Pony Foo',
  description: '',
  author: {
    meta: 'Nicolas Bevacqua <foo@bevacqua.io>',
    twitter: '@nzgb'
  },
  images: {
    cover: '',
    list: []
  },
  partial: null
};

module.exports = {
  respond: function (req, res, next) {
    var accept = req.headers.accept || '';
    var data = _.extend({}, defaults, res.viewModel);

    if (!data) {
      next();
    } else if (~accept.indexOf('html')) {
      if (data.partial) {
        // render partial fn, passing `data`. then render
        //res.partial = {result};
      }
      // then always:
      res.render('__layout', data);
    } else if (~accept.indexOf('json')) {
      res.json(data);
    } else {
      next();
    }
  }
};
