'use strict';

const bcrypt = require('bcrypt');
const crypto = require('crypto');
const env = require('../lib/env');
const factor = env('SALT_WORK_FACTOR');

function encrypt (value, done) {
  bcrypt.genSalt(factor, function (err, salt) {
    if (err) {
      done(err); return;
    }

    bcrypt.hash(value, salt, done);
  });
}

function test (hash, value, done) {
  if (value === null || value === undefined || hash === null || hash === undefined) {
    done(null, false); return;
  }

  bcrypt.compare(value, hash, done);
}

function md5 (value) {
  return crypto.createHash('md5').update(String(value)).digest('hex');
}

module.exports = {
  encrypt: encrypt,
  test: test,
  md5: md5
};
