'use strict';

var moment = require('moment');
var winston = require('winston');
var env = require('./env');
var production = env('NODE_ENV') === 'production';
var devtime = 'mm:ss';
var prodtime = 'DD MMM HH:mm:ss';
var time = production ? prodtime : devtime;
var stdout = winston.transports.Console;

function configure () {
  winston.remove(stdout);
  winston.add(stdout, {
    timestamp: timestamp,
    colorize: !production,
    level: env('LOGGING_LEVEL')
  });
}

function timestamp () {
  return moment().format(time);
}

module.exports = {
  configure: configure
};
