'use strict';

var winston = require('winston');
var hackerpub = require('hackerpub');
var env = require('../lib/env');
var username = env('HN_USERNAME');
var password = env('HN_PASSWORD');

function submit (data, done) {
  if (username && password) {
    post();
  } else {
    winston.info('HN: ' + data.title);
    done();
  }

  function post () {
    hackerpub({
      username: username,
      password: password,
      title: data.title,
      url: data.url
    }, done);
  }
}

module.exports = {
  submit: submit
};
