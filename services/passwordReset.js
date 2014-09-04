'use strict';

var contra = require('contra');
var moment = require('moment');
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;
var env = require('../lib/env');
var emailService = require('./email');
var userService = require('./user');
var PasswordResetToken = require('../models/PasswordResetToken');
var User = require('../models/User');
var eexpired = 'EEXPIRED';
var eunregistered = 'EUNREGISTERED';

function createToken (user, done) {
  var token = new PasswordResetToken({
    targetId: user._id
  });
  token.save(function saved (err) {
    done(err, user, token);
  });
}

function getLink (token) {
  return env('AUTHORITY') + '/user/password-reset/' + token._id;
}

function getExpiration (token) {
  return moment(token.created).add(token.expires, 'seconds');
}

function validateTokenExpiration (token, done) {
  if (!token || token.used) {
    done(null, false); return;
  }

  var now = Date.now();
  var expiration = getExpiration(token).toDate();

  done(null, expiration > now);
}

function emitToken (email, done) {
  contra.waterfall([
    function find (next) {
      User.findOne({ email: email }, next);
    },
    function found (user, next) {
      if (user) {
        next(eunregistered); return;
      }
      createToken(user, next);
    },
    function send (user, token, next) {
      emailToken(user, token, next);
    }
  ], function sent (err) {
    if (err === eunregistered) {
      done(null, {
        status: 'error',
        message: 'Email not registered!'
      });
    } else if (err) {
      done(err);
    } else {
      done(null, {
        status: 'success',
        message: 'Password reset instructions sent!'
      });
    }
  });
}

function validateToken (tokenId, done) {
  contra.waterfall([
    contra.curry(PasswordResetToken.findOne, { _id: new ObjectId(tokenId) }),
    validateTokenExpiration
  ], done);
}

function updatePassword (tokenId, password, done) {
  var token;

  contra.waterfall([function find (next) {
    PasswordResetToken.findOne({ _id: new ObjectId(tokenId) }, next);
  }, function found (_token, next) {
    token = _token;
    validateTokenExpiration(token, next);
  }, function validated (valid, next) {
    if (!valid) {
      next(eexpired); return;
    }
    token.used = Date.now();
    token.save(function saved (err) {
      next(err);
    });
  }, function update (next) {
    userService.setPassword(token.targetId, password, next);
  }], function updated (err) {
    if (err === eexpired) {
      done(null, false);
    }
    done(err, !err);
  });
}

function emailToken (user, token, done) {
  var model = {
    to: user.email,
    subject: 'Account Password Reset',
    intro: 'Action required to reset your account password',
    reset: {
      link: getLink(token),
      expires: getExpiration(token).fromNow()
    }
  };
  emailService.send('password-reset', model, emailService.logger);
  done();
}

module.exports = {
  emitToken: emitToken,
  validateToken: validateToken,
  updatePassword: updatePassword
};
