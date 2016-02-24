'use strict';

var env = require('../../lib/env');
var registration = env('REGISTRATION_OPEN');
var data = require('../../lib/authentication/data');
var inliningService = require('../../services/inlining');
var providers = Object.keys(data.providers).filter(enabled).map(namePair);

function enabled (key) {
  return data.providers[key].enabled;
}

function namePair (key) {
  var p = data.providers[key];
  return { name: p.name, link: p.link, css: p.css };
}

module.exports = function (req, res, next) {
  res.viewModel = {
    model: {
      title: 'Login',
      registration: registration,
      meta: {
        canonical: '/account/login'
      },
      providers: providers
    }
  };
  inliningService.addStyles(res.viewModel.model, 'login');
  next();
};
