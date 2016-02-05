'use strict';

var winston = require('winston');
var env = require('../../../lib/env');
var secret = env('GITHUB_HOOK_SECRET');

function secretOnly (req, res, next) {
  var ok = req.headers['X-Hub-Signature'] === secret;
  if (!ok) {
    winston.warn('Unauthorized request to git API endpoint.');
  }
  next(ok ? null : 'route');
}

module.exports = secretOnly;
