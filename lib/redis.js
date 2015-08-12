'use strict';

var winston = require('winston');
var redis = require('redis').createClient;
var env = require('./env');
var host = env('REDIS_HOST');
var port = env('REDIS_PORT');
var pass = env('REDIS_PASSWORD');
var enabled = host && port && pass;

module.exports = enabled ? init() : { pub: null, sub: null, enabled: false };

function init () {
  var pub = redis(port, host, { auth_pass: pass });
  var sub = redis(port, host, { auth_pass: pass, detect_buffers: true });

  pub.on('connect', logConnected('pub'));
  sub.on('connect', logConnected('sub'));
  pub.on('error', logRedisError);
  sub.on('error', logRedisError);

  return { pub: pub, sub: sub, enabled: true };
}

function logConnected (type) {
  return function connected () {
    winston.debug('Redis connected to host %s (%s)', host, type);
  };
}

function logRedisError (err) {
  winston.error('Error in redis connection', { stack: err.stack || err.message || err || '(unknown)' });
}
