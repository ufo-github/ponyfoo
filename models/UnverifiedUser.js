'use strict';

var mongoose = require('mongoose');
var cryptoService = require('../services/crypto');
var schema = new mongoose.Schema({
  email: { type: String, require: true },
  password: { type: String, require: true }
}, { id: false });

schema.pre('save', beforeSave);

function beforeSave (done) {
  var user = this;

  if (!user.isModified('password')) {
    done(); return;
  }
  encryptPassword(user, done);
}

function encryptPassword (user, done) {
  cryptoService.encrypt(user.password, function encrypted (err, hash) {
    if (err) {
      done(err); return;
    }
    user.password = hash;
    done();
  });
}


module.exports = mongoose.model('unverifiedUser', schema);
