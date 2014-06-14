'use strict';

var moment = require('moment');
var winston = require('winston');
var env = require('./env');
var stdout = winston.transports.Console;

function configure () {
  winston.remove(stdout);
  winston.add(stdout, {
    timestamp: timestamp,
    colorize: env('NODE_ENV') !== 'production',
    level: env('LOGGING_LEVEL')
  });
}

function timestamp () {
  return moment().format('DD MMM HH:mm:ss');
}

module.exports = {
  configure: configure
};
