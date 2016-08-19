'use strict';

const env = require(`../../lib/env`);
const data = require(`../../lib/authentication/data`);
const inliningService = require(`../../services/inlining`);
const registration = env(`REGISTRATION_OPEN`);
const providers = Object.keys(data.providers).filter(enabled).map(toProviderModel);

function enabled (key) {
  return data.providers[key].enabled;
}

function toProviderModel (key) {
  const { name, link, css } = data.providers[key];
  return { name, link, css };
}

module.exports = function (req, res, next) {
  res.viewModel = {
    model: {
      title: `Login`,
      meta: {
        canonical: `/account/login`
      },
      registration,
      providers
    }
  };
  inliningService.addStyles(res.viewModel.model, `login`);
  next();
};
