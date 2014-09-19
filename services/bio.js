'use strict';

var moment = require('moment');
var User = require('../models/User');
var env = require('../lib/env');
var cache = {};

function get (email, done) {
  if (email in cache) {
    done(null, cache[email]); return;
  }
  User.findOne({ email: email }, 'bioHtml', found);

  function found (err, user) {
    if (err) {
      done(err); return;
    }
    update(email, user.bioHtml);
    done(null, user.bioHtml);
  }
}

function update (email, html) {
  cache[email] = html;
}

module.exports = {
  update: update,
  get: get
};
