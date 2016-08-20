'use strict';

const UnverifiedUser = require(`../../../models/UnverifiedUser`);
const datetimeService = require(`../../../services/datetime`);
const userService = require(`../../../services/user`);

module.exports = function (req, res, next) {
  UnverifiedUser.find({}).exec(respond);

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
        users: users.map(toUnverifiedUserModel)
      }
    };
    next();
  }
};

function toUnverifiedUserModel (user) {
  return {
    created: user.created ? datetimeService.field(user.created) : null,
    email: user.email,
    avatar: userService.getAvatar(user)
  };
}
