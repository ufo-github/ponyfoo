'use strict';

var util = require('util');
var mongoose = require('mongoose');
var cryptoService = require('../services/crypto');
var gravatarService = require('../services/gravatar');
var schema = new mongoose.Schema({
  email: { type: String, require: true, index: { unique: true }, trim: true },
  password: { type: String, require: true },
  bypassEncryption: { type: Boolean, 'default': true },
  created: { type: Date, require: true, 'default': Date.now },
  displayName: { type: String },
  facebookId: { type: String },
  githubId: { type: String },
  googleId: { type: String },
  linkedinId: { type: String },
  bio: { type: String }
}, { id: false, toObject: { getters: true }, toJSON: { getters: true } });

schema.virtual('gravatar').get(computeGravatar);
schema.pre('save', beforeSave);
schema.methods.validatePassword = validatePassword;

function computeGravatar () {
  return gravatarService.format(this.email);
}

function beforeSave (done) {
  var user = this;
  if (user.bypassEncryption) { // password already encrypted, we shouldn't re-encrypt it
    user.bypassEncryption = false;
    done(); return;
  }
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

function validatePassword (input, cb) {
  cryptoService.test(this.password, input, cb);
}

module.exports = mongoose.model('User', schema);
