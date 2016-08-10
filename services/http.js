'use strict';

const _ = require('lodash');
const util = require('util');
const safeson = require('safeson');
const taunus = require('taunus');
const accepts = require('accepts');
const pkg = require('../package.json');
const env = require('../lib/env');
const authority = env('AUTHORITY');
const environment = env('NODE_ENV');
const userAgent = util.format('%s@%s/%s', pkg.name, pkg.version, environment);
const dev = environment === 'development';
const textSpaces = dev ? 2 : 0;

function referer (req) {
  const r = req.headers.referer || '';
  return r.indexOf(authority) === 0 ? r : '/';
}

function validationError (req, res, result) {
  response(req, res, 400, result, sane(req.body));
}

function isJson (req) {
  const accept = accepts(req).types('html', 'json');
  const json = accept === 'json' || 'json' in req.query;
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
    const encoded = safeson(data, textSpaces);
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
    const store = data[key];
    const collection = Array.isArray(store) ? store : [store];
    collection.forEach(copy);
    function copy (value) {
      req.flash(key, value);
    }
  }
}

function redirect (req, res, url, options) {
  const href = url || referer(req);
  const o = options || {};
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
