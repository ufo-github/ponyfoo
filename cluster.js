'use strict';

require('./lib/preconfigure');
require('./chdir');

var lipstick = require('lipstick');
var cores = require('os').cpus().length;
var workers = Math.max(cores, 2);
var env = require('./lib/env');
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
}
