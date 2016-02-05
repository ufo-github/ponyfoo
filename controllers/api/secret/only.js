'use strict';

var fs = require('fs');
var winston = require('winston');
var secret = fs.readFileSync('.bin/secret', 'utf8').trim();

function secretOnly (req, res, next) {
  var ok = req.params.secret === secret;
  if (!ok) {
    winston.warn('Unauthorized request to secret API endpoint.');
  }
  next(ok ? null : 'route');
}

module.exports = secretOnly;
