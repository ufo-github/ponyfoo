'use strict';

var mongoose = require('mongoose');
var mongoUri = require('mongodb-uri');
var winston = require('winston');
var env = require('./env');
var uri = env('MONGO_URI');
var delayToReconnect = 1000;
var options = require('./dbOptions');
var log = env('LOG_MONGO_CONNECTION') !== false;
var dbName;
var initialized = false;
var disconnecting;

function connect (done) {
  var db = mongoose.connection;
  if (initialized === false) {
    initialized = true;
    logging(db);
    reconnection(db);
  }
  db.once('connected', done);
  open(db);
}

function disconnect (done) {
  var db = mongoose.connection;
  if (db.readyState !== 0) {
    disconnecting = true;
    db.once('disconnected', disconnected);
    db.close();
  }
  function disconnected () {
    disconnecting = false;
    if (done) { done(); }
  }
}

function open (db) {
  dbName = mongoUri.parse(uri).database;
  if (log) {
    winston.debug('Opening database connection to {db:%s}...', dbName);
  }
  mongoose.connect(uri, options);
}

function logging (db) {
  db.on('connected', function connected () {
    if (log) {
      winston.info('Database connection to {db:%s} established.', dbName);
    }
  });
  db.on('open', function open () {
    if (log) {
      winston.debug('Database connection to {db:%s} opened.', dbName);
    }
  });
  db.on('disconnected', function disconnected () {
    if (disconnecting !== true) {
      if (log) {
        winston.error('Database connection to {db:%s} lost.', dbName);
      }
    }
  });
  db.on('error', function error (err) {
    if (log) {
      winston.error('Database connection to {db:%s} error.', dbName, { stack: err.stack || err.message || err || '(unknown)' });
    }
  });
}

function reconnection (db) {
  var timer;

  db.on('disconnected', schedule);
  db.on('connected', clear);

  function schedule () {
    if (disconnecting) {
      if (log) {
        winston.info('Database connection to {db:%s} explicitly shut down.', dbName);
      }
      return;
    }
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(reconnect, delayToReconnect);
  }

  function reconnect () {
    timer = false;
    open(db);
  }

  function clear () {
    if (timer) {
      clearTimeout(timer);
    }
    timer = false;
  }
}

module.exports = connect;

connect.disconnect = disconnect;
