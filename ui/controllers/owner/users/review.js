'use strict';

const util = require(`util`);
const datetimeService = require(`../../../services/datetime`);
const emojiService = require(`../../../services/emoji`);
const userService = require(`../../../services/user`);

module.exports = function (req, res, next) {
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
        users: contributors.map(toUserModel)
      }
    };
    next();
  }
};

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
  if (role === `owner`) {
    return icon(`👑`, `Founder`);
  }
  if (role === `editor`) {
    return icon(`📑`, `Contributing Editor`);
  }
  if (role === `articles`) {
    return icon(`✍`, `Contributing Author`);
  }
  if (role === `weeklies`) {
    return icon(`💌`, `Newsletter Contributor`);
  }
  if (role === `moderator`) {
    return icon(`🏥`, `Moderator`);
  }
  return icon(`❓`, util.format(`Unknown (“%s”)`, role));
  function icon (emoji, alt) {
    return util.format(`<span aria-label="%s">%s</span>`, alt, emojiService.compile(emoji));
  }
}
