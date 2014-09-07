'use strict';

var util = require('util');
var request = require('request');
var cryptoService = require('./crypto');
var fmt = 'http://www.gravatar.com/avatar/%s?d=identicon&r=PG';
var tiny = '&s=24';

function hash (email) {
  return cryptoService.md5(email);
}

function format (email) {
  return util.format(fmt, hash(email));
}

function fetch (email, done) {
  request({
    url: util.format(fmt + tiny, hash(email)),
    encoding: 'binary'
  }, recode);

  function recode (err, res, body) {
    if (err || !body) {
      done(err || new Error('Gravatar response body is empty')); return;
    }

    done(null, {
      mime: res.type,
      data: new Buffer(body, 'binary').toString('base64')
    });
  }
}


module.exports = {
  fetch: fetch
};
