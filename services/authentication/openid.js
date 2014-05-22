'use strict';

var passport = require('passport');
var env = require('../../lib/env');
var data = require('./data');
var providerHandler = require('./providerHandler');
var authority = env('AUTHORITY');

module.exports = function openid (name, Strategy) {
  var opts = {
    returnURL: authority + data[name].callback,
    realm: authority
  };

  passport.use(new Strategy(opts, openidHandler));

  function openidHandler (identifier, profile, done) {
    var query = {};
    query[name + 'Id'] = identifier;
    providerHandler(query, profile, done);
  }
}
