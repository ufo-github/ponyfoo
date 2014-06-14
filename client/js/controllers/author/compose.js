'use strict';

var $ = require('dominus');
var raf = require('raf');
var taunus = require('taunus');
var flexarea = require('flexarea');
var ponymark = require('ponymark');
var textService = require('../../../../services/text');

module.exports = function () {
  var title = $('.ac-title');
  var slug = $('.ac-slug');
  var texts = $('.ac-text');
  var tags = $('.ac-tags');
  var preview = $.findOne('.ac-preview');
  var previewTitle = $('.ac-preview-title');
  var previewTags = $.findOne('.ac-preview-tags');
  var boundSlug = true;

  texts.forEach(function (text) {
    ponymark({ buttons: text, input: text, preview: preview });
  });
  texts.find('.pmk-input').forEach(flexarea);

  tags.on('keypress keydown paste', raf.bind(null, updateTags));
  title.on('keypress keydown paste', raf.bind(null, bindTitle));
  slug.on('keypress keydown', unbindSlug);

  function bindTitle () {
    updatePreviewTitle();

    if (boundSlug) {
      updateSlug();
    }
  }
  function unbindSlug () {
    boundSlug = false;
  }

  function updateSlug () {
    slug.value(textService.slug(title.value()));
  }

  function updatePreviewTitle () {
    previewTitle.text(title.value());
  }

  function updateTags () {
    var individualTags = textService.splitTags(tags.value());
    var model = {
      tags: individualTags
    };
    taunus.partial(previewTags, 'partials/tags', model);
  }
};
