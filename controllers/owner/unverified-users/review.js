'use strict';

const { sortBy } = require(`lodash`);
const datetimeService = require(`../../../services/datetime`);
const userService = require(`../../../services/user`);

module.exports = function (req, res, next) {
  userService.findUnverified(respond);

  function respond (err, users) {
    if (err) {
      next(err); return;
    }
    res.viewModel = {
      model: {
        title: `Unverified Users \u2014 Pony Foo`,
        meta: {
          canonical: `/users/unverified/review`
        },
        users: sortBy(users, byCreation).map(toUnverifiedUserModel)
      }
    };
    next();
  }
};

function byCreation ({ created = new Date(0) }) {
  return Date.now() - created;
}

function toUnverifiedUserModel (user) {
  return {
    created: user.created ? datetimeService.field(user.created) : null,
    email: user.email,
    avatar: userService.getAvatar(user)
  };
}
