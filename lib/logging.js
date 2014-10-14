'use strict';

var moment = require('moment');
var winston = require('winston');
var mongo = require('winston-mongodb').MongoDB;
var env = require('./env');
var hosted = env('NODE_ENV') !== 'development';
var level = env('LOGGING_LEVEL');
var devtime = 'mm:ss';
var prodtime = 'DD MMM HH:mm:ss';
var time = hosted ? prodtime : devtime;
var stdout = winston.transports.Console;

function createWriteStream (level) {
  return {
    write: function () {
      var args = Array.prototype.slice.call(arguments);
      args[0] = args[0].replace(/\n+$/, ''); // remove trailing breaks
      winston[level].apply(winston, args);
    }
  };
}

function configure () {
  winston.createWriteStream = createWriteStream;

  winston.remove(stdout);
  winston.add(stdout, {
    level: level,
    timestamp: timestamp,
    colorize: !hosted
  });
  winston.add(mongo, {
    level: level,
    dbUri: dbUri
  });
}

function timestamp () {
  return moment().format(time);
}

module.exports = {
  configure: configure
};
