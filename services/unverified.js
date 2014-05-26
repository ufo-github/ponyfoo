'use strict';

var async = require('async');
var config = require('../config');
var userService = require('./user');
var verificationService = require('./verification');
var UnverifiedUser = require('../models/UnverifiedUser');

function validate (input, done) {
  var email = input.email;
  var password = input.password;
  var messages = [];

  if (typeof email !== 'string' || email.length === 0) {
    messages.push('The email address can\'t be empty');
  } else if (!config.env.development && !config.remail.test(email)) {
    messages.push('You must provide a valid email address');
  } else {
    input.email = email.trim().toLowerCase(); // ignore case
  }

  if (typeof password !== 'string' || password.length === 0) {
    messages.push('Your password can\'t be empty');
  }

  done(null, messages);
}

function create (email, password, done) {
  var user = new UnverifiedUser({
    email: email,
    displayName: email.split('@')[0],
    password: password
  });
  user.save(function saved (err) {
    done(err, user);
  });
}

function register (input, done) {
  var messages;

  async.waterfall([
    function validation (next) {
      validate(input, function validated (err, result){
        messages = result;
        next(err);
      });
    },
    function find (next) {
      userService.findOne({ email: input.email }, next);
    },
    function availability (user, next) {
      if (user !== null) {
        messages.unshift('That email address is unavailable');
      }
      next(messages.length ? messages : null);
    },
    function creation (next) {
      create(input.email, input.password, next);
    },
    function emit (user, next) {
      verificationService.emitToken(user, next);
    }
  ], function respond (err) {
    if (err === messages) { // just validation issues, not a 'real' error.
      return done(null, messages);
    }
    done(err);
  });
}

module.exports = {
  register: register
};
