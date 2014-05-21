'use strict';

var providerHandler = require('./providerHandler');

module.exports = function (name, Strategy, fields) {
  if(!config.auth[name].enabled){
    return;
  }
  var opts = {
    consumerKey: config.auth[name].id,
    consumerSecret: config.auth[name].secret,
    callbackURL: config.server.authorityBlog + config.auth[name].callback,
    profileFields: fields
  };

  passport.use(new Strategy(opts, oauthOneHandler));

  function oauthOneHandler (token, tokenSecret, profile, done) {
    var query = {};
    query[name + 'Id'] = profile.id;
    providerHandler(query, profile, done);
  }
};
