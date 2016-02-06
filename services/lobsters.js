'use strict';

var winston = require('winston');
var lob = require('lob-story');
var env = require('../lib/env');
var username = env('LOBSTERS_USERNAME');
var password = env('LOBSTERS_PASSWORD');

function submit (data, done) {
  if (username && password) {
    post();
  } else {
    winston.info('Lobste.rs: ' + data.title);
    done();
  }

  function post () {
    lob({
      username: username,
      password: password,
      title: data.title,
      url: data.url,
      tags: ['javascript', 'web'],
      author: true
    }, done);
  }
}

module.exports = {
  submit: submit
};
