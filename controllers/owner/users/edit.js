'use strict';

const contra = require(`contra`);
const bioService = require(`../../../services/bio`);
const User = require(`../../../models/User`);

module.exports = function (req, res, next) {
  const id = req.params.id;

  contra.waterfall([getUser, getBio, select], respond);

  function getUser (next) {
    User.findOne({ _id: id }).lean().exec(next);
  }

  function getBio (user, next) {
    if (!user) {
      next(null, {}, ``); return;
    }
    bioService.getMarkdown(user.email, got);
    function got (err, bio) {
      next(err, user, bio);
    }
  }

  function select (user, bio, next) {
    next(null, {
      id: user._id && user._id.toString(),
      email: user.email,
      displayName: user.displayName,
      slug: user.slug,
      twitter: user.twitter,
      website: user.website,
      avatar: user.avatar,
      roles: user.roles || [`articles`],
      bio: user.bio
    });
  }

  function respond (err, profile) {
    if (err) {
      next(err); return;
    }
    res.viewModel = {
      model: {
        title: id ? `Edit User` : `Create User`,
        meta: {
          canonical: `/users/` + (id ? id + `/edit` : `new`)
        },
        editing: !!profile.id,
        profile: profile,
        action: `owner/users/edit`
      }
    };
    next();
  }
};
