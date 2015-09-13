'use strict';

var wemoji = require('wemoji');
var emojiRandom = require('emoji-random');
var emojiTrim = require('trim-emoji');

function generate (categories) {
  var name = emojiTrim(emojiRandom.random());
  var data = wemoji.name[name];
  if (
    data &&
    data.platforms.indexOf('tw') !== -1 && (
     !categories ||
      categories.indexOf(data.category) !== -1
    )
  ) {
    return data.emoji;
  }
  return generate(categories);
}

module.exports = {
  generate: generate
};
