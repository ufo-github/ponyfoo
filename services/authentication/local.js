'use strict';

var contra = require('contra');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('../../models/User.js');
var elogin = 'ELOGIN';

function localSetup () {
  passport.use(new LocalStrategy({ usernameField: 'email' }, localHandler));
}

function localHandler (email, password, done) {
  contra.waterfall([
    contra.curry(User.findOne, { email: email }),
    function validateUser (user, next) {
      if (!user || !user.password) {
        next(elogin); return;
      }
      user.validatePassword(password, next);
    },
    function validateCredentials (isMatch, next) {
      if(!isMatch){
        next(elogin); return;
      }
      next(null, user.toObject());
    }
  ], function evaluateResult (err, user) {
    if (err === elogin) {
      done(null, false, 'Invalid login credentials'); return;
    }
    done(err, user);
  });
}

module.exports = localSetup;
