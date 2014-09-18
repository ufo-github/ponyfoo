'use strict';

var moment = require('moment');
var User = require('../models/User');
var env = require('../lib/env');
var authorEmail = env('AUTHOR_EMAIL');
var cached;
var cache;

function get (done) {
  if (cached) {
    done(null, cache); return;
  }
  User.findOne({ email: authorEmail }, 'bioHtml', found);

  function found (err, user) {
    if (err) {
      done(err); return;
    }
    update(user.bioHtml);
    done(null, user.bioHtml);
  }
}

function update (html) {
  cached = true;
  cache = html;
}

module.exports = {
  update: update,
  get: get
};
