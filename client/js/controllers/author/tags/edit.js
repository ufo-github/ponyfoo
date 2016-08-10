'use strict';

var $ = require('dominus');
var sluggish = require('sluggish');

module.exports = function () {
  var title = $('.tge-title');
  var slug = $('.tge-slug');
  var boundSlug = true;

  title.on('keypress keydown paste input', typingTitle);
  slug.on('keypress keydown paste input', typingSlug);

  function typingTitle () {
    if (boundSlug) {
      slug.value(sluggish(title.value()));
    }
  }

  function typingSlug () {
    boundSlug = false;
  }
};
