'use strict';

var util = require('util');
var winston = require('winston');
var truncText = require('trunc-text');
var env = require('./env');
var debug = env('LOG_DEBUG_ELASTICSEARCH');

function loggingElasticsearch (config) {
  var debug = log('debug');
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

  if (debug !== true) {
    this.debug = function () {};
  }
}

function log (type) {
  return function () {
    var args = Array.prototype.slice.call(arguments);
    var all = ['elasticsearch:'].concat(args).map(brief);
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
