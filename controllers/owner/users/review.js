'use strict';

const { sortBy } = require(`lodash`);
const datetimeService = require(`../../../services/datetime`);
const emojiService = require(`../../../services/emoji`);
const userService = require(`../../../services/user`);
const roleInfo = new Map([
  [`owner`, {
    emoji: `👑`,
    title: `Founder`
  }],
  [`editor`, {
    emoji: `📑`,
    title: `Contributing Editor`
  }],
  [`articles`, {
    emoji: `✍`,
    title: `Contributing Author`
  }],
  [`weeklies`, {
    emoji: `💌`,
    title: `Newsletter Contributor`
  }],
  [`moderator`, {
    emoji: `🏥`,
    title: `Moderator`
  }]
]);

module.exports = userReview;

function userReview (req, res, next) {
  userService.findContributors(respond);
  function respond (err, contributors) {
    if (err) {
      next(err); return;
    }
    res.viewModel = {
      model: {
        title: `Users \u2014 Pony Foo`,
        meta: {
          canonical: `/users/review`
        },
        users: sortBy(contributors, byCreation).map(toUserModel),
        currentUser: req.user.toString()
      }
    };
    next();
  }
}

function byCreation ({ created }) {
  return Date.now() - created;
}

function toUserModel (contributor) {
  const user = contributor.user;
  return {
    id: user._id.toString(),
    created: datetimeService.field(user.created),
    roles: user.roles.map(roleAsEmoji).join(` `),
    displayName: user.displayName,
    email: user.email,
    avatar: userService.getAvatar(user),
    slug: user.slug,
    active: userService.isActive(contributor)
  };
}

function roleAsEmoji (role) {
  const defaultRoleInfo = { emoji: `❓`, title: `Unknown (“${ role }”)` };
  const { emoji, title } = roleInfo.get(role) || defaultRoleInfo;
  const compiledEmoji = emojiService.compile(emoji);
  return `<span aria-label="${ title }">${ compiledEmoji }</span>`;
}
