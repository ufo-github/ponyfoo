'use strict';

var env = require('../../lib/env');
var staticService = require('../../services/static');
var authority = env('AUTHORITY');

module.exports = function (req, res, next) {
  res.viewModel = {
    model: {
      title: 'Invoicing \u2014 Pony Foo',
      meta: {
        canonical: '/owner/invoicing',
        description: 'I love the web. I am a consultant, a conference speaker, the author of JavaScript Application Design, an opinionated blogger, and an open-source evangelist. I participate actively in the online JavaScript community — as well as offline in beautiful Buenos Aires.'
      }
    }
  };
  next();
}
