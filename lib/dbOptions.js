'use strict';

var socket = {
  socketOptions: { connectTimeoutMS: 5000, keepAlive: 1 }
};
var options = {
  server: socket,
  replset: socket,
  db: { native_parser: true }
};

module.exports = options;
