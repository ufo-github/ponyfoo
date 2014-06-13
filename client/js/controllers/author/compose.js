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
  var previewTitle = $('.ac-preview-title');
  var boundSlug = true;

  texts.forEach(function (text) {
    ponymark({ buttons: text, input: text, preview: preview });
  });
  texts.find('.pmk-input').forEach(flexarea);
  title.on('keypress keydown paste', bindTitle);
  slug.on('keypress keydown', unbindSlug);

  function bindTitle () {
    setTimeout(updatePreviewTitle, 0);
    setTimeout(boundSlug ? updateSlug : Function, 0);
  }
  function unbindSlug () { boundSlug = false; }

  function updateSlug () {
    slug.value(textService.slug(title.value()));
  }

  function updatePreviewTitle () {
    previewTitle.text(title.value());
  }
};
