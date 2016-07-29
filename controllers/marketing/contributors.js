'use strict';

var _ = require('lodash');
var contra = require('contra');
var env = require('../../lib/env');
var Article = require('../../models/Article');
var User = require('../../models/User');
var userService = require('../../services/user');

module.exports = function (req, res, next) {
  contra.waterfall([findUsers, countArticles], respond);

  function findUsers (done) {
    User
      .find({})
      .sort('created')
      .lean()
      .exec(done);
  }

  function countArticles (users, done) {
    contra.map(users, hydrateWithArticleCount, done);

    function hydrateWithArticleCount (user, next) {
      Article
        .count({ author: user._id, status: 'published' })
        .exec(counted);

      function counted (err, count) {
        if (err) {
          next(err); return;
        }
        next(null, {
          doc: user,
          articleCount: count
        });
      }
    }
  }

  function respond (err, users) {
    if (err) {
      next(err); return;
    }
    if (!users || !users.length) {
      next('route'); return;
    }
    var active = users.filter(whereSlug).filter(whereActive);
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

function whereSlug (user) {
  return !!user.doc.slug;
}

function whereActive (user) {
  return userService.isActive(user.doc, {
    articleCount: user.articleCount
  });
}

function toProfile (user) {
  return userService.getProfile(user.doc, {
    withBio: false,
    articleCount: user.articleCount
  });
}
