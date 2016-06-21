'use strict';

var User = require('../models/User');
var gravatarService = require('./gravatar');

function getModel (email, password, bypass) {
  return {
    email: email,
    password: password,
    bypassEncryption: bypass,
    displayName: email.split('@')[0]
  };
}

function getProfile (user, options) {
  var avatar = user.avatar || user.gravatar;
  var profile = {
    avatar: avatar,
    displayName: user.displayName,
    slug: user.slug,
    twitter: user.twitter,
    website: user.website
  };
  if (options.withBio) {
    profile.bioHtml = user.bioHtml;
  }
  return profile;
}

function create (bypass) {
  return function creation (email, password, done) {
    var model = getModel(email, password, bypass);
    var user = new User(model);

    user.save(function saved (err) {
      done(err, user);
    });
  };
}

function findById (id, done) {
  User.findOne({ _id: id }, done);
}

function findOne (query, done) {
  User.findOne(query, done);
}

function setPassword (userId, password, done) {
  User.findOne({ _id: userId }, function found (err, user) {
    if(err || !user){
      return done(err, false);
    }

    user.password = password;
    user.save(done);
  });
}

function hasRole (user, roles) {
  return roles.some(userHasRole);
  function userHasRole (role) {
    return user.roles.indexOf(role) !== -1;
  }
}

module.exports = {
  findById: findById,
  findOne: findOne,
  create: create(false),
  createUsingEncryptedPassword: create(true),
  setPassword: setPassword,
  getProfile: getProfile,
  hasRole: hasRole
};
