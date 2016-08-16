'use strict';

const User = require(`../models/User`);
const userService = require(`../services/user`);

module.exports = function hydrateUserObject (req, res, next) {
  if (!req.user) {
    next(); return;
  }
  User
    .findOne({ _id: req.user })
    .select(`roles displayName slug email avatar`)
    .exec(foundUser);

  function foundUser (err, user) {
    if (err) {
      next(err); return;
    }
    if (!user) {
      req.user = null;
      next();
      return;
    }
    req.userObject = {
      slug: user.slug,
      roles: user.roles,
      displayName: user.displayName,
      avatar: userService.getAvatar(user)
    };
    next(null);
  }
};
