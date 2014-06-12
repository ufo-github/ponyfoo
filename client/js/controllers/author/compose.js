'use strict';

var $ = require('dominus');
var flexarea = require('flexarea');
var ponymark = require('ponymark');

module.exports = function () {
  var title = $('.ac-title');
  var slug = $('.ac-slug');
  var texts = $('.ac-text');
  var preview = $.findOne('.ac-preview');
  var boundSlug = true;

  texts.forEach(function (text) {
    ponymark({ buttons: text, input: text, preview: preview });
  });
  texts.find('.pmk-input').forEach(flexarea);
  title.on('keypress paste', bindSlug);
  slug.on('keypress', unbindSlug);

  function bindSlug () {
    if (boundSlug) {
      slug.value(title.value());
    }
  }

  function unbindSlug () {
    boundSlug = false;
  }
};
