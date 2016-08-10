'use strict';

const winston = require('winston');
const hackerpub = require('hackerpub');
const env = require('../lib/env');
const username = env('HN_USERNAME');
const password = env('HN_PASSWORD');

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
