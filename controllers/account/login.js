'use strict';

const env = require('../../lib/env');
const registration = env('REGISTRATION_OPEN');
const data = require('../../lib/authentication/data');
const inliningService = require('../../services/inlining');
const providers = Object.keys(data.providers).filter(enabled).map(namePair);

function enabled (key) {
  return data.providers[key].enabled;
}

function namePair (key) {
  const p = data.providers[key];
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
