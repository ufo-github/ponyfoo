'use strict';

var winston = require('winston');

function cspReport (req, res, next) {
  if (req.body) {
    winston.warn('csp violation', req.body);
  }
  res.status(204).end();
}

module.exports = cspReport;
