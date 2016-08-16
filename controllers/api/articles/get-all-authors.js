'use strict';

const userService = require(`../../../services/user`);

function getAllAuthors (req, res, next) {
  findUsers(respond);

  function findUsers (done) {
    userService.findAllUsersInRole([`owner`, `articles`], done);
  }

  function respond (err, users) {
    if (err) {
      next(err); return;
    }
    res.json([{
      id: `Authors`,
      list: toUserModels(users)
    }]);
  }
}

function toUserModels (users) {
  return users.map(user => ({
    slug: user.slug,
    displayName: user.displayName,
    avatar: userService.getAvatar(user)
  }));
}

module.exports = getAllAuthors;
