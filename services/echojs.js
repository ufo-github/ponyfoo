'use strict';

var contra = require('contra');
var lamernews = require('lamernews-client');
var client = lamernews.createClient({ api: 'http://www.echojs.com' });
var env = require('../lib/env');
var username = env('ECHOJS_USERNAME');
var password = env('ECHOJS_PASSWORD');

function submit (data, done) {
  if (username && password) {
    contra.waterfall([login, post], done);
  } else {
    done();
  }

  function login (next) {
    client.login({ username: username, password: password }, next);
  }

  function post (next) {
    client.submit(data, next);
  }
}

module.exports = {
  submit: submit
};
