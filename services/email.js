'use strict';

var _ = require('lodash');
var util = require('util');
var path = require('path');
var campaign = require('campaign');
var jade = require('campaign-jade');
var winston = require('winston');
var env = require('../lib/env');
var mode = env('MANDRILL_MODE');
var apiKey = env('MANDRILL_API_KEY');
var from = env('MANDRILL_SENDER');
var trap = env('MANDRILL_TRAP');
var client = createClient();
var defaults = {
  domain: {
    authority: env('AUTHORITY')
  },
  social: {
    twitter: {
      url: 'https://twitter.com/ponyfoo',
      handle: '@ponyfoo'
    },
    landing: {
      url: 'http://ponyfoo.com',
      name: 'Pony Foo'
    },
    name: 'Pony Foo'
  }
};

function createClient () {
  var options = {
    headerImage: path.resolve('./resources/emails/header.png'),
    templateEngine: jade,
    mandrill: { apiKey: apiKey },
    from: from
  };
  if (mode === 'trap') { // staging environments should trap emails
    options.trap = trap;
  } else if (mode === 'debug') { // no reason to send any emails
    options.provider = campaign.providers.terminal();
  }
  return campaign(options);
}

function send (type, model, done) {
  var extended = _.merge({}, defaults, model);
  var template = path.resolve('views/emails', type);
  client.send(template, extended, done);
}

function logger () {
  var args = Array.prototype.slice.call(arguments);
  var err = args.shift(), message;
  if (err) {
    message = util.format('Email sending failed: %s', err.message || '\n' + err.stack);
    winston.error(message, {
      err: err,
      args: args
    });
  } else {
    winston.debug('Email sent!');
  }
}

module.exports = {
  send: send,
  logger: logger
};
