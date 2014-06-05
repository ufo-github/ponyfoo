'use strict';

var passport = require('passport');
var env = require('../../lib/env');
var data = require('./data');
var providerHandler = require('./providerHandler');

module.exports = function oauthTwo (name, Strategy) {
  if (!data[name].enabled) {
    return;
  }
  var opts = {
    clientID: data[name].id,
    clientSecret: data[name].secret,
    callbackURL: env('AUTHORITY') + data[name].callback
  };

  passport.use(new Strategy(opts, oauthTwoHandler));

  function oauthTwoHandler (accessToken, refreshToken, profile, done) {
    var query = {};
    query[name + 'Id'] = profile.id;
    providerHandler(query, profile, done);
  }
};
