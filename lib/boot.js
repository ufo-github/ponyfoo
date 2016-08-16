'use strict';

const winston = require(`winston`);
const db = require(`./db`);
const logging = require(`./logging`);
const elasticsearch = require(`./elasticsearch`);
const models = require(`../models`);
const pkg = require(`../package.json`);

function boot (done) {
  db(dbOperational);

  function dbOperational () {
    logging.configure();
    winston.info(`Worker %s executing app@%s`, process.pid, pkg.version);
    process.on(`uncaughtException`, fatal);
    models();
    elasticsearch();
    winston.debug(`Boot completed.`);
    if (done) {
      done(null);
    }
  }
}

function fatal (err) {
  winston.error(`Uncaught exception`, { stack: err.stack || err.message || err || `(unknown)` }, exit);
}

function exit () {
  process.exit(1);
}

module.exports = boot;
