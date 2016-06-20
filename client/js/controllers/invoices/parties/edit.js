'use strict';

var $ = require('dominus');
var debounce = require('lodash/function/debounce');
var sluggish = require('sluggish');
var raf = require('raf');

module.exports = function (viewModel, container, route) {
  var editing = viewModel.editing;
  var name = $('.ivp-name');
  var title = $('.ivp-title');
  var slug = $('.ivp-slug');
  var boundSlug = !editing;
  var boundTitle = !editing;
  var typingNameSlowly = raf.bind(null, debounce(typingName, 100));
  var typingTitleSlowly = raf.bind(null, debounce(typingTitle, 100));
  var typingSlugSlowly = raf.bind(null, debounce(typingSlug, 100));

  name.on('keypress keydown paste input', typingNameSlowly);
  title.on('keypress keydown paste input', typingTitleSlowly);
  slug.on('keypress keydown paste input', typingSlugSlowly);

  function typingName () {
    if (boundTitle) { updateTitle(); }
    if (boundSlug) { updateSlug(); }
  }

  function typingSlug () { boundSlug = false; }
  function typingTitle () { boundSlug = false; boundTitle = false; }

  function updateTitle () {
    title.value(name.value());
  }

  function updateSlug () {
    slug.value(sluggish(title.value()));
  }
};
