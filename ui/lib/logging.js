'use strict';

const moment = require(`moment`);
const mongoose = require(`mongoose`);
const winston = require(`winston`);
const mongo = require(`winston-mongodb`).MongoDB;
const env = require(`./env`);
const hosted = env(`NODE_ENV`) !== `development`;
const level = env(`LOGGING_LEVEL`);
const devtime = `mm:ss`;
const prodtime = `DD MMM HH:mm:ss`;
const time = hosted ? prodtime : devtime;
const stdout = winston.transports.Console;

winston.createWriteStream = createWriteStream;
winston.remove(stdout);
winston.add(stdout, {
  level: level,
  timestamp: timestamp,
  colorize: !hosted
});

function createWriteStream (level) {
  return {
    write: function () {
      const args = Array.prototype.slice.call(arguments);
      args[0] = args[0].replace(/\n+$/, ``); // remove trailing breaks
      winston[level].apply(winston, args);
    }
  };
}

function configure () {
  winston.add(mongo, {
    level: level,
    db: mongoose.connection.db,
    collection: `logs`
  });
}

function timestamp () {
  return moment().format(time);
}

module.exports = {
  configure: configure
};
