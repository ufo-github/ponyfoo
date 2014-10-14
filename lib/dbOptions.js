'use strict';

var socket = {
  socketOptions: { connectTimeoutMS: 2000, keepAlive: 1 }
};
var options = {
  server: socket,
  replset: socket,
  db: { native_parser: true }
};

module.exports = options;
