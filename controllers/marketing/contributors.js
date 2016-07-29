'use strict';

var _ = require('lodash');
var contra = require('contra');
var env = require('../../lib/env');
var Article = require('../../models/Article');
var User = require('../../models/User');
var userService = require('../../services/user');

module.exports = function (req, res, next) {
  userService.findContributors(respond);

  function respond (err, contributors) {
    if (err) {
      next(err); return;
    }
    if (!contributors || !contributors.length) {
      next('route'); return;
    }
    var active = contributors.filter(whereSlug).filter(userService.isActive);
    var profiles = active.map(toProfile);
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

function whereSlug (contributor) {
  return !!contributor.user.slug;
}

function toProfile (contributor) {
  return userService.getProfile(contributor, {
    withBio: false
  });
}
