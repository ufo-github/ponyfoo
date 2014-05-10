'use strict';

var mongoose = require('mongoose');
var winston = require('winston');
var uri = process.env.MONGO_URI;
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
  var db = mongoose.createConnection();

  logging(db);
  reconnection(db);
  open(db);

  db.once('connected', done.bind(null, null, db));
}

function open (db) {
  winston.info('Opening database connection...');
  db.open(uri, options);
}

function logging (db) {
  winston.info('Database connection established');

  db.on('open', function open () {
    winston.info('Database connection opened.');
  });
  db.on('connected', function connected () {
    winston.info('Database connection successful!');
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
