'use strict';

var providerHandler = require('./providerHandler');

module.exports = function (name, Strategy) {
  if(!config.auth[name].enabled){
    return;
  }
  var opts = {
    clientID: config.auth[name].id,
    clientSecret: config.auth[name].secret,
    callbackURL: config.server.authorityBlog + config.auth[name].callback
  };

  passport.use(new Strategy(opts, oauthTwoHandler));

  function oauthTwoHandler (accessToken, refreshToken, profile, done) {
    var query = {};
    query[name + 'Id'] = profile.id;
    providerHandler(query, profile, done);
  }
}
