'use strict';

var path = require('path');
var campaign = require('campaign');
var winston = require('winston');
var env = require('../lib/env');
var production = env('NODE_ENV') === 'production';
var staging = env('NODE_ENV') === 'staging';
var client = createClient();

function createClient () {
  if (production) { // in production, send emails
    return campaign({ provider: require('campaign-jade') });
  } else if (staging) { // staging environments should trap emails
    return campaign({ provider: require('campaign-jade'), trap: true });
  } else { // during development, there's no reason to send any emails
    return campaign({ provider: campaign.providers.terminal() });
  }
}

function send (type, model, done) {
  var template = path.resolve('views/emails', type);
  client.send(template, model, done);
}

function logger (err) {
  if (err) {
    winston.error('Email sending failed', {
      err: err,
      args: arguments
    });
  } else {
    winston.debug('Email sent');
  }
}

module.exports = {
  send: send,
  logger: logger
};
