'use strict';

const env = require('../../lib/env');
const staticService = require('../../services/static');
const authority = env('AUTHORITY');

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
