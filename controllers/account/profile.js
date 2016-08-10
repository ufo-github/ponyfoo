'use strict';

const contra = require('contra');
const bioService = require('../../services/bio');
const User = require('../../models/User');

module.exports = function (req, res, next) {
  contra.waterfall([getUser, getBio], respond);

  function getUser (next) {
    User.findOne({ _id: req.user }).exec(next);
  }

  function getBio (user, next) {
    if (!user) {
      next(new Error('Please log out and authenticate again!')); return;
    }
    bioService.getMarkdown(user.email, got);
    function got (err, bio) {
      next(err, {
        email: user.email,
        displayName: user.displayName,
        slug: user.slug,
        twitter: user.twitter,
        website: user.website,
        avatar: user.avatar,
        bio: bio
      });
    }
  }

  function respond (err, profile) {
    if (err) {
      next(err); return;
    }
    res.viewModel = {
      model: {
        title: 'Bio Editor',
        meta: {
          canonical: '/account/bio'
        },
        profile: profile
      }
    };
    next();
  }
};
