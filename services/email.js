'use strict';

var util = require('util');
var path = require('path');
var campaign = require('campaign');
var assign = require('assignment');
var mailgun = require('campaign-mailgun');
var jade = require('campaign-ponyfoo');
var winston = require('winston');
var htmlService = require('./html');
var env = require('../lib/env');
var mode = env('MAILGUN_MODE');
var apiKey = env('MAILGUN_API_KEY');
var from = env('MAILGUN_SENDER');
var trap = env('MAILGUN_TRAP');
var authority = env('AUTHORITY');
var client = createClient();
var defaults = {
  domain: {
    authority: authority
  },
  social: {
    twitter: {
      url: 'https://twitter.com/ponyfoo',
      handle: '@ponyfoo'
    },
    landing: {
      url: 'https://ponyfoo.com',
      name: 'Pony Foo'
    },
    name: 'Pony Foo'
  },
  styles: {
    layoutBackgroundColor: '#fcfcfc',
    bodyBackgroundColor: '#fcfcfc',
    footerBackgroundColor: '#fcfcfc',
    layoutTextColor: '#000',
    bodyTextColor: '#000',
    headerColor: '#000',
    horizontalBorderColor: 'transparent',
    linkColor: '#e92c6c',
    quoteBorderColor: '#ffe270',
    quoteBackgroundColor: '#fef2c5',
    codeBorderRightColor: '#f3720d',
    codeBorderBottomColor: '#ffb77e',
    codeBackgroundColor: '#ffeadb'
  }
};
var api = {
  send: send,
  logger: logger
};

function createClient () {
  var options = {
    headerImage: path.resolve('./resources/emails/header.png'),
    templateEngine: jade,
    provider: mailgun({ apiKey: apiKey, authority: authority }),
    formatting: formatting,
    from: from
  };
  if (mode === 'trap') { // staging environments should trap emails
    options.trap = trap;
  } else if (mode === 'debug') { // no reason to send any emails
    options.provider = require('campaign-terminal')();
  }
  return campaign(options);
}

function send (type, model, done) {
  var extended = assign({}, defaults, model);
  var template = path.resolve('.bin/views/server/emails', type);
  client.send(template, extended, done || logger);
  api.getLastEmailHtml = getLastEmailHtml;
  function getLastEmailHtml (done) {
    client.render(template, extended, done);
  }
}

function formatting (html) {
  return htmlService.fixedEmojiSize(html);
}

function logger () {
  var args = Array.prototype.slice.call(arguments);
  var err = args.shift(), message;
  if (err) {
    message = util.format('Email sending failed: %s', err.message || '\n' + err.stack);
    winston.error(message, { stack: err.stack || err.message || err || '(unknown)' });
  } else {
    winston.debug('Email sent!');
  }
}

module.exports = api;
