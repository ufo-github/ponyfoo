'use strict';

var env = require('../../lib/env');
var registration = env('REGISTRATION_OPEN');
var authority = env('AUTHORITY');

module.exports = function (req, res, next) {
  res.viewModel = {
    model: {
      title: 'Login',
      registration: registration,
      meta: {
        canonical: authority + '/account/login'
      }
    }
  };
  next();
};
