'use strict';

var env = require('../../lib/env');
var staticService = require('../../services/static');
var authority = env('AUTHORITY');

module.exports = function (req, res, next) {
  res.viewModel = {
    model: {
      meta: {
        canonical: '/weekly/sponsor',
        description: 'Learn about our sponsorship opportunities and advertise with us!',
        images: [authority + staticService.unroll('/img/ponyfooweekly-sample.png')]
      },
      title: 'Sponsorship \u2014 Pony Foo Weekly'
    }
  };
  next();
};
