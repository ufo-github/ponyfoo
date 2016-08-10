'use strict';

require('./preconfigure');
require('./chdir');

const os = require('os');
const winston = require('winston');
const lipstick = require('lipstick');
const env = require('./lib/env');
const boot = require('./lib/boot');
const cores = os.cpus().length;
const workers = Math.max(cores, 2);
const port = env('PORT');
const options = {
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
