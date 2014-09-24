'use strict';

var contra = require('contra');
var bioService = require('../../services/bio');
var User = require('../../models/User');

module.exports = function (req, res, next) {
  contra.waterfall([getUser, getBio], respond);

  function getUser (next) {
    User.findOne({ _id: req.user }, 'email', next);
  }

  function getBio (user, next) {
    bioService.getMarkdown(user.email, next);
  }

  function respond (err, bio) {
    if (err) {
      next(err); return;
    }
    res.viewModel = {
      model: {
        title: 'Bio Editor',
        meta: {
          canonical: '/account/bio'
        },
        bio: bio
      }
    };
    next();
  }
};
