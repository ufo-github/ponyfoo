'use strict';

var env = require('../../lib/env');
var authority = env('AUTHORITY');
var notFound = '/not-found';

module.exports = function (req, res, next) {
  if (req.url !== notFound) {
    res.redirect(notFound); return;
  }

  res.viewModel = {
    model: {
      title: 'Not Found!',
      meta: {
        canonical: authority + '/not-found'
      }
    }
  };
  next();
};
