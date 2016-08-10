'use strict';

const util = require('util');
const winston = require('winston');
const truncText = require('trunc-text');
const env = require('./env');
const verbose = env('LOG_DEBUG_ELASTICSEARCH');

function loggingElasticsearch () {
  const debug = log('debug');
  this.error = log('error');
  this.warning = log('warn');
  this.info = log('info');
  this.debug = debug;
  this.trace = function (method, requestUrl, body, responseBody, responseStatus) {
    return debug(util.format('%s %s – %s\n%s',
      method,
      requestUrl.path,
      responseStatus,
      brief(body)
    ).trim());
  };
  this.close = function () {};

  if (verbose !== true) {
    this.debug = function () {};
  }
}

function log (type) {
  return function () {
    const args = Array.prototype.slice.call(arguments);
    const all = ['elasticsearch:'].concat(args).map(brief);
    return winston[type].apply(winston, all);
  };
}

function brief (message) {
  if (message === undefined) {
    return '';
  }
  if (typeof message === 'string') {
    return truncText(message, 400);
  }
  return message;
}

module.exports = loggingElasticsearch;
