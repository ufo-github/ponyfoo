'use strict';

var providerHandler = require('./providerHandler');

module.exports = function (name, Strategy) {
  var opts = {
    returnURL: config.server.authorityBlog + config.auth[name].callback,
    realm: config.server.authorityBlog
  };

  passport.use(new Strategy(opts, openidHandler));

  function openidHandler (identifier, profile, done) {
    var query = {};
    query[name + 'Id'] = identifier;
    providerHandler(query, profile, done);
  }
}
