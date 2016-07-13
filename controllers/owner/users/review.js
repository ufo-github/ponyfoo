'use strict';

var util = require('util');
var User = require('../../../models/User');
var datetimeService = require('../../../services/datetime');
var emojiService = require('../../../services/emoji');
var userService = require('../../../services/user');

module.exports = function (req, res, next) {
  User.find({}).sort('-created').lean().exec(found);
  function found (err, users) {
    if (err) {
      next(err); return;
    }
    res.viewModel = {
      model: {
        title: 'Users \u2014 Pony Foo',
        meta: {
          canonical: '/users'
        },
        users: users.map(toUserModel)
      }
    };
    next();
  }
};

function toUserModel (user) {
  return {
    id: user._id.toString(),
    created: datetimeService.field(user.created),
    roles: user.roles.map(roleAsEmoji).join(' '),
    displayName: user.displayName,
    email: user.email,
    avatar: userService.getAvatar(user),
    slug: user.slug
  };
}

function roleAsEmoji (role) {
  if (role === 'owner') {
    return marked('🎩', 'Founder');
  }
  if (role === 'editor') {
    return marked('📑', 'Contributing Editor');
  }
  if (role === 'articles') {
    return marked('✍', 'Contributing Author');
  }
  if (role === 'weeklies') {
    return marked('💌', 'Newsletter Contributor');
  }
  if (role === 'moderator') {
    return marked('🏥', 'Moderator');
  }
  return marked('❓', util.format('Unknown (“%s”)', role));
  function marked (emoji, alt) {
    return util.format('<span aria-label="%s">%s</span>', alt, emojiService.compile(emoji));
  }
}
