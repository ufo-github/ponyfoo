'use strict';

var User = require('../../models/User.js');
// TODO I WAS HERE
module.exports = function (query, profile, done) {
  var email = profile.emails ? profile.emails[0].value : undefined;
  if (!email) {
    return done(null, false, 'Unable to fetch email address');
  }

  User.findOne(query, function (err, user) {
    if (err || user) {
      return done(err, user ? user.toObject() : null);
    }

    User.findOne({ email: email }, function (err, user) {
      var prop;

      if (err) {
        return done(err);
      }

      if (!user) { // register user
        query.email = email;
        query.displayName = profile.displayName;
        user = new User(query);
      } else { // add provider to user
        for (prop in query) {
          user[prop] = query[prop];
        }

        if (!user.displayName) {
          user.displayName = profile.displayName;
        }
      }

      user.save(function saved (err, user){
        done(err, user ? user.toObject() : null);
      });
    });
  });
}
