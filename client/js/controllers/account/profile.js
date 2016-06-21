'use strict';

var $ = require('dominus');
var raf = require('raf');
var taunus = require('taunus');
var sluggish = require('sluggish');
var debounce = require('lodash/function/debounce');
var markdownService = require('../../../../services/markdown');
var rparagraph = /^<p>|<\/p>$/ig;

module.exports = function (viewModel, container) {
  var displayName = $('.cb-name', container);
  var slug = $('.cb-slug', container);
  var bio = $('.cb-bio', container);
  var twitter = $('.cb-twitter', container);
  var website = $('.cb-website', container);
  var preview = $('.cb-preview', container);
  var avatar = $('.cb-avatar', container);
  var saveButton = $('.cb-save', container);
  var updatePreviewSlowly = raf.bind(null, debounce(updatePreview, 200));
  var updateSlugSlowly = raf.bind(null, debounce(updateSlug, 200));

  displayName.on('keypress keydown paste input', updateSlugSlowly);
  slug.once('keypress keydown paste input', unbindSlug);
  bio.on('keypress keydown paste input', updatePreviewSlowly);
  saveButton.on('click', save);
  updatePreview();

  function unbindSlug () {
    displayName.off('keypress keydown paste input', updateSlugSlowly);
  }

  function updateSlug () {
    slug.value(sluggish(displayName.value()));
  }

  function updatePreview () {
    preview.html(getHtml(bio).trim().replace(rparagraph, '') || 'Main body of your bio');
  }

  function getHtml (el) {
    return markdownService.compile(el.value());
  }

  function save () {
    var data = {
      json: {
        displayName: displayName.value(),
        slug: slug.value(),
        bio: bio.value(),
        twitter: twitter.value(),
        website: website.value(),
        avatar: avatar.value()
      }
    };
    viewModel.measly.patch('/api/account/profile', data).on('data', leave);

    function leave () {
      taunus.navigate('/');
    }
  }
};
