'use strict';

var _ = require('lodash');
var util = require('util');
var safeson = require('safeson');
var winston = require('winston');
var taunus = require('taunus');
var accepts = require('accepts');
var pkg = require('../package.json');
var env = require('../lib/env');
var authority = env('AUTHORITY');
var environment = env('NODE_ENV');
var userAgent = util.format('%s@%s/%s', pkg.name, pkg.version, environment);
var dev = environment === 'development';
var textSpaces = dev ? 2 : 0;

function referer (req) {
  var r = req.headers.referer || '';
  return r.indexOf(authority) === 0 ? r : '/';
}

function validationError (req, res, result) {
  response(req, res, 400, result, sane(req.body));
}

function isJson (req) {
  var accept = accepts(req).types('html', 'json');
  var json = accept === 'json' || 'json' in req.query;
  return json;
}

function asText (req) {
  return 'as-text' in req.query;
}

function isJsonAsText (req) {
  return isJson(req) && asText(req);
}

function response (req, res, statusCode, data, flashOnly) {
  if (isJson(req)) {
    data.version = taunus.state.version;
    res.status(statusCode);
    if (asText(req)) {
      text();
    } else {
      json();
    }
  } else {
    flash();
  }
  function text () {
    var encoded = safeson(data, textSpaces);
    res.set('Content-Type', 'text/html; charset=utf-8');
    res.send(encoded);
  }
  function json () {
    res.json(data);
  }
  function flash () {
    flashCopy(req, data);
    if (flashOnly) {
      req.flash('model', flashOnly);
    }
    res.redirect(referer(req));
  }
}

function flashCopy (req, data) {
  Object.keys(data).forEach(flash); // copy data onto flash
  function flash (key) {
    var store = data[key];
    var collection = Array.isArray(store) ? store : [store];
    collection.forEach(copy);
    function copy (value) {
      req.flash(key, value);
    }
  }
}

function redirect (req, res, url, options) {
  var href = url || referer(req);
  var o = options || {};
  if (o.flash) {
    flashCopy(req, o.flash);
  }
  taunus.redirect(req, res, href, {
    hard: o.hard,
    force: o.force
  });
}

function sane (body) {
  return _.omit(body, 'password');
}

function classic (req, res, next, fn) {
  return function clasicHandler (err, result) {
    if (err) {
      next(err);
    } else if (result && result.validation && result.validation.length) {
      validationError(req, res, result);
    } else {
      fn.apply(null, Array.prototype.slice.call(arguments, 1));
    }
  };
}

module.exports = {
  userAgent: userAgent,
  validationError: validationError,
  response: response,
  redirect: redirect,
  referer: referer,
  classic: classic,
  isJsonAsText: isJsonAsText
};
