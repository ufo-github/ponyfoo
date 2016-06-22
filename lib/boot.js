'use strict';

var winston = require('winston');
var db = require('./db');
var logging = require('./logging');
var elasticsearch = require('./elasticsearch');
var models = require('../models');
var pkg = require('../package.json');

function boot (done) {
  db(dbOperational);

  function dbOperational () {
    logging.configure();
    winston.info('Worker %s executing app@%s', process.pid, pkg.version);
    process.on('uncaughtException', fatal);
    models();
    elasticsearch();
    winston.debug('Boot completed.');
    if (done) {
      done(null);
    }
  }
}

function fatal (err) {
  winston.error('Uncaught exception', { stack: err.stack || err.message || err || '(unknown)' }, exit);
}

function exit () {
  process.exit(1);
}

module.exports = boot;
