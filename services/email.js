'use strict';

const fs = require('fs');
const path = require('path');
const util = require('util');
const campaign = require('campaign');
const assign = require('assignment');
const mailgun = require('campaign-mailgun');
const term = require('campaign-terminal');
const jadum = require('jadum');
const winston = require('winston');
const htmlService = require('./html');
const staticService = require('./static');
const env = require('../lib/env');
const mode = env('EMAIL_MODE');
const from = env('EMAIL_SENDER');
const trap = env('EMAIL_TRAP');
const apiKey = env('MAILGUN_API_KEY');
const authority = env('AUTHORITY');
const cssFile = path.resolve(__dirname, '../.bin/static/email.css');
const css = fs.readFileSync(cssFile, 'utf8');
const layoutFile = '../.bin/views/server/emails/layout.js';
const defaults = {
  authority: authority,
  social: {
    facebook: {
      url: 'https://facebook.com/ponyfoo',
      handle: '@ponyfoo'
    },
    twitter: {
      url: 'https://twitter.com/ponyfoo',
      handle: '@ponyfoo'
    },
    landing: {
      url: 'https://ponyfoo.com',
      name: 'ponyfoo.com'
    }
  },
  styles: { base: css }
};
const api = {
  send: send,
  logger: logger
};
const templateEngine = {
  defaultLayout: layoutFile,
  render: renderTemplate,
  renderString: renderTemplateString
};
const modes = {
  debug: configureDebug,
  trap: configureTrap,
  send: configureSend
};
const client = createClient();

function createClient () {
  const options = configureClient();
  return campaign(options);
}

function configureClient () {
  const brandedHeader = staticService.unroll('/img/banners/branded.png');
  const headerImage = path.join('.bin/public', brandedHeader);
  const defaults = {
    headerImage: headerImage,
    templateEngine: templateEngine,
    formatting: formatting,
    from: from
  };
  if (!modes.hasOwnProperty(mode)) {
    throw new Error('Expected "EMAIL_MODE" environment variable to be one of: "debug", "trap", "send".');
  }
  const configureMode = modes[mode];
  const modeConfiguration = configureMode();
  return assign(defaults, modeConfiguration);
}

function configureDebug () {
  return {
    provider: term()
  };
}

function configureTrap () {
  return {
    trap: trap,
    provider: createSendProvider()
  };
}

function configureSend () {
  return {
    provider: createSendProvider()
  };
}

function createSendProvider () {
  return mailgun({ apiKey: apiKey, authority: authority });
}

function send (type, model, done) {
  const extended = assign({}, defaults, model);
  const template = path.resolve('.bin/views/server/emails', type);
  client.send(template, extended, done || logger);
  api.getLastEmailHtml = getLastEmailHtml;
  function getLastEmailHtml (done) {
    client.render(template, extended, done);
  }
}

function formatting (html) {
  return htmlService.fixedEmojiSize(html);
}

function logger (err) {
  if (err) {
    let message = util.format('Email sending failed: %s', err.message || '\n' + err.stack);
    winston.error(message, { stack: err.stack || err.message || err || '(unknown)' });
  } else {
    winston.debug('Email sent!');
  }
}

function renderTemplate (file, model, done) {
  done(null, require(file)(model));
}

function renderTemplateString (template, model, done) {
  done(null, jadum.render(template, model));
}

module.exports = api;
