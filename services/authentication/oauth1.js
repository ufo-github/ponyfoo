'use strict';

var passport = require('passport');
var env = require('../../lib/env');
var data = require('./data');
var providerHandler = require('./providerHandler');

module.exports = function oauthOne (name, Strategy, fields) {
  if (!data[name].enabled) {
    return;
  }
  var opts = {
    consumerKey: data[name].id,
    consumerSecret: data[name].secret,
    callbackURL: env('AUTHORITY') + data[name].callback,
    profileFields: fields
  };

  passport.use(new Strategy(opts, oauthOneHandler));

  function oauthOneHandler (token, tokenSecret, profile, done) {
    var query = {};
    query[name + 'Id'] = profile.id;
    providerHandler(query, profile, done);
  }
};
