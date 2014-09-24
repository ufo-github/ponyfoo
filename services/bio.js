'use strict';

var moment = require('moment');
var User = require('../models/User');
var env = require('../lib/env');
var cache = {};

function get (email, field, done) {
  if (cache[email] && field in cache[email]) {
    done(null, cache[email][field]); return;
  }
  User.findOne({ email: email }, field, found);

  function found (err, user) {
    if (err) {
      done(err); return;
    }
    update(email, field, user[field]);
    done(null, user[field]);
  }
}

function update (email, field, value) {
  if (!(email in cache)) {
    cache[email] = {};
  }
  cache[email][field] = value;
}

function getHtml (email, done) {
  get(email, 'bioHtml', done);
}

function getMarkdown (email, done) {
  get(email, 'bio', done);
}

function updateHtml (email, html) {
  update(email, 'bioHtml', html);
}

module.exports = {
  updateHtml: updateHtml,
  getHtml: getHtml,
  getMarkdown: getMarkdown
};
