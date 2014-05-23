'use strict';

var async = require('async');
var config = require('../config');
var userService = require('./userService.js');
var userVerificationService = require('./userVerificationService.js');
var UserUnverified = require('../model/UserUnverified.js');

function validate (input, done) {
  var email = input.email;
  var password = input.password;
  var messages = [];

  if (typeof email !== 'string' || email.length === 0) {
    messages.push('The email address can\'t be empty');
  } else if (!config.env.development && !config.remail.test(email)) {
    messages.push('You must pick a valid email address');
  } else {
    input.email = email.trim().toLowerCase(); // ignore case
  }

  if (typeof password !== 'string' || password.length === 0) {
    messages.push('Your password can\'t be empty');
  }

  done(null, messages);
}

function create (email, password, done) {
  var user = new UserUnverified({
    email: email,
    displayName: email.split('@')[0],
    password: password
  });
  user.save(function (err) {
    done(err, user);
  });
}

function register(input, done){
  var messages;

  async.waterfall([
    function(next){
      validate(input, function(err, result){
        messages = result;
        next(err);
      });
    },
    function(next){
      userService.findOne({ email: input.email }, function(err, user){
        next(err, user);
      });
    },
    function(user, next){
      if(user !== null){
        messages.unshift('That email address is unavailable');
      }

      if (messages.length){
        next(messages);
      }else{
        next();
      }
    },
    function(next){
      create(input.email, input.password, next);
    },
    function(user, next){
      userVerificationService.emitToken(user, next);
    }
  ], function(err){
    if(err === messages){ // just validation issues, not a 'real' error.
      return done(null, messages);
    }
    done(err);
  });
}

module.exports = {
  register: register
};
