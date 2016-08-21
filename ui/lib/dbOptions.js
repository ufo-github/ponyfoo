'use strict';

const socket = {
  socketOptions: { connectTimeoutMS: 5000, keepAlive: 1 }
};
const options = {
  server: socket,
  replset: socket,
  db: { native_parser: true }
};

module.exports = options;
