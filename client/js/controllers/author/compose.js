'use strict';

var $ = require('dominus');
var flexarea = require('flexarea');
var ponymark = require('ponymark');
var textService = require('../../../../services/text');

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
  title.on('keypress keydown paste', bindSlug);
  slug.on('keypress keydown', unbindSlug);

  function bindSlug () { setTimeout(boundSlug ? updateSlug : Function, 0); }
  function unbindSlug () { boundSlug = false; }

  function updateSlug () {
    slug.value(textService.slug(title.value()));
  }
};
