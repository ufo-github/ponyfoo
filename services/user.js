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
  var rstrip = /^\s*<p>\s*|\s*<\/p>\s*$/ig;
  var profile = {
    avatar: getAvatar(user),
    displayName: user.displayName,
    slug: user.slug,
    role: humanReadableRole(user.roles, options.articleCount !== 0),
    twitter: user.twitter,
    website: user.website
  };
  if (options.withBio) {
    profile.bioHtml = user.bioHtml.replace(rstrip, '');
  }
  return profile;
}

function getAvatar (user) {
  if (user.avatar) {
    return user.avatar;
  }
  if (user.email) {
    return gravatarService.format(user.email) + '&s=24';
  }
  return 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mm&f=y&s=24';
}

function humanReadableRole (roles, hasPublishedArticles) {
  var terms = [];
  if (roles.indexOf('articles') !== -1 && hasPublishedArticles) {
    terms.push('Contributing Author');
  }
  if (roles.indexOf('moderator') !== -1) {
    terms.push('Contributing Editor');
  }
  if (roles.indexOf('moderator') !== -1) {
    terms.push('Moderator');
  }
  if (roles.indexOf('weeklies') !== -1) {
    terms.push('Pony Foo Weekly');
  }
  if (roles.indexOf('owner') !== -1) {
    return 'Founder';
  }
  if (terms.length) {
    return concatenate();
  }
  return 'Collaborator';
  function concatenate () {
    var firstTerm = terms.shift();
    var len = terms.length;
    return terms.reduce(join, firstTerm);
    function join (all, term, i, terms) {
      var separator = len > 1 ? ', ' : ' ';
      var joiner = len === i + 1 ? 'and ' : '';
      return all + separator + joiner + term;
    }
  }
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

function isActive (user, options) {
  var roles = user.roles;
  var singleRole = roles.length === 1;
  var articleUser = singleRole && roles[0] === 'articles';
  if (articleUser && options && options.articleCount === 0) {
    return false;
  }
  return true;
}

module.exports = {
  findById: findById,
  findOne: findOne,
  create: create(false),
  createUsingEncryptedPassword: create(true),
  setPassword: setPassword,
  getProfile: getProfile,
  getAvatar: getAvatar,
  hasRole: hasRole,
  isActive: isActive
};
