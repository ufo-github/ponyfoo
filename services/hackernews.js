'use strict';

var hackerpub = require('hackerpub');
var env = require('../lib/env');
var username = env('HN_USERNAME');
var password = env('HN_PASSWORD');

function submit (data, done) {
  if (username && password) {
    post();
  } else {
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
