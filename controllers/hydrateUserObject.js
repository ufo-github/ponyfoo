'use strict';

const User = require('../models/User');

module.exports = function hydrateUserObject (req, res, next) {
  if (!req.user) {
    next(); return;
  }
  User
    .findOne({ _id: req.user })
    .select('roles displayName')
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
      roles: user.roles,
      displayName: user.displayName
    };
    next(null);
  }
};
