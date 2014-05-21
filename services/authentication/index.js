'use strict';

var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy = require('passport-google').Strategy;
var GitHubStrategy = require('passport-github').Strategy;
var LinkedInStrategy = require('passport-linkedin').Strategy;
var User = require('../../models/User');
var local = require('./local');
var oauth1 = require('./oauth1');
var oauth2 = require('./oauth2');
var openid = require('./openid');

function serialize (user, done) {
  done(null, user._id);
}

function deserialize (id, done) {
  User.findOne({ _id: id }, function found (err, user) {
    done(err, user ? user.toObject() : null);
  });
}

function initialize () {
  passport.serializeUser(serialize);
  passport.deserializeUser(deserialize);
  local();
  oauth1('linkedin', LinkedInStrategy, ['id', 'first-name', 'last-name', 'email-address']);
  oauth2('facebook', FacebookStrategy);
  oauth2('github', GitHubStrategy);
  openid('google', GoogleStrategy);
}

module.exports = {
  initialize: initialize
};
