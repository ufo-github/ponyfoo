'use strict';

require('./preconfigure');
require('./chdir');

var os = require('os');
var winston = require('winston');
var lipstick = require('lipstick');
var env = require('./lib/env');
var boot = require('./lib/boot');
var cores = os.cpus().length;
var workers = Math.max(cores, 2);
var port = env('PORT');
var options = {
  port: port,
  workers: workers
};

if (module.parent) {
  module.exports = start;
} else {
  start();
}

function start () {
  boot(booted);
}

function booted () {
  lipstick(options, listening);
}

function listening (err, port) {
  if (err) {
    winston.error('unhandled cluster error', err.stack || err); return;
  }
  winston.info('cluster listening on port %s.', port);
}
