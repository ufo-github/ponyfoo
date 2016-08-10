'use strict';

const contra = require('contra');
const winston = require('winston');
const lamernews = require('lamernews-client');
const client = lamernews.createClient({ api: 'http://www.echojs.com' });
const env = require('../lib/env');
const username = env('ECHOJS_USERNAME');
const password = env('ECHOJS_PASSWORD');

function submit (data, done) {
  if (username && password) {
    contra.waterfall([login, post], done);
  } else {
    winston.info('EchoJS: ' + data.title);
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
