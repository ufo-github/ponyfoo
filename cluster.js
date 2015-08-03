'use strict';

require('./preconfigure');
require('./chdir');

var winston = require('winston');
var lipstick = require('lipstick');
var cores = require('os').cpus().length;
var workers = Math.max(cores, 2);
var env = require('./lib/env');
var db = require('./lib/db');
var logging = require('./lib/logging');
var port = env('PORT');

if (module.parent) {
  module.exports = start;
} else {
  start();
}

function start () {
  lipstick({
    port: port,
    workers: workers
  });
  logging.configure();
  db(operational);
}

function operational () {
  process.on('uncaughtException', fatal);
}

function fatal (err) {
  winston.error('Uncaught exception (cluster)', { error: err, stack: err.stack || '(none)' }, exit);
}
