'use strict';

const winston = require('winston');

function cspReport (req, res) {
  if (req.body) {
    winston.warn('CSP header violation', req.body);
  }
  res.status(204).end();
}

module.exports = cspReport;
