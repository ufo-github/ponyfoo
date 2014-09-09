'use strict';

var mongoose = require('mongoose');
var winston = require('winston');
var env = require('./env');
var uri = env('MONGO_URI');
var socket = {
  socketOptions: { connectTimeoutMS: 500, keepAlive: 1 }
};
var options = {
  server: socket,
  replset: socket,
  db: { native_parser: true }
};
var delay = 1000;

function connect (done) {
  if (connect.connection) {
    done(null, connect.connection); return;
  }

  var db = connect.connection = mongoose.connection;

  logging(db);
  reconnection(db);
  open(db);

  db.once('connected', done.bind(null, null, db));
}

function open (db) {
  winston.debug('Opening database connection...');
  db.open(uri, options);
}

function logging (db) {
  db.on('connected', function connected () {
    winston.info('Database connection established.');
  });
  db.on('open', function open () {
    winston.debug('Database connection opened.');
  });
  db.on('disconnected', function disconnected () {
    winston.error('Database connection lost.');
  });
  db.on('error', function error (err) {
    winston.error('Database connection error.\n', err.stack || err);
  });
}

function reconnection (db) {
  var timer;

  db.on('disconnected', schedule);
  db.on('connected', clear);

  function schedule () {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(reconnect, delay);
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
