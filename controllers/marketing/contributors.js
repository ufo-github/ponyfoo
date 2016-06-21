'use strict';

var _ = require('lodash');
var env = require('../../lib/env');
var User = require('../../models/User');
var userService = require('../../services/user');

module.exports = function (req, res, next) {
  var query = {
    roles: {
      $in: ['owner', 'articles']
    }
  };
  User.find(query).sort('created').lean().exec(found);
  function found (err, users) {
    if (err) {
      next(err); return;
    }
    if (!users || !users.length) {
      next('route'); return;
    }
    var profiles = users.map(toProfile);
    var images = _.pluck(profiles, 'gravatar');
    res.viewModel = {
      model: {
        title: 'Contributors \u2014 Pony Foo',
        meta: {
          canonical: '/contributors',
          description: 'Check out all the contributors and writers in collaboration with Pony Foo!',
          images: images
        },
        profiles: profiles
      }
    };
    next();
  }
}

function toProfile (user) {
  return userService.getProfile(user, { withBio: false });
}
