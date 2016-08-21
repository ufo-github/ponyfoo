'use strict';

const winston = require(`winston`);
const redis = require(`redis`).createClient;
const env = require(`./env`);
const host = env(`REDIS_HOST`);
const port = env(`REDIS_PORT`);
const pass = env(`REDIS_PASSWORD`);
const enabled = host && port && pass;

module.exports = enabled ? init() : { pub: null, sub: null, enabled: false };

function init () {
  const pub = redis(port, host, { auth_pass: pass });
  const sub = redis(port, host, { auth_pass: pass, detect_buffers: true });

  pub.on(`connect`, logConnected(`pub`));
  sub.on(`connect`, logConnected(`sub`));
  pub.on(`error`, logRedisError);
  sub.on(`error`, logRedisError);

  return { pub: pub, sub: sub, enabled: true };
}

function logConnected (type) {
  return function connected () {
    winston.debug(`Redis connected to host %s (%s)`, host, type);
  };
}

function logRedisError (err) {
  winston.error(`Error in redis connection`, { stack: err.stack || err.message || err || `(unknown)` });
}
