'use strict';

const $ = require('dominus');
const debounce = require('lodash/debounce');
const sluggish = require('sluggish');
const raf = require('raf');

module.exports = function (viewModel) {
  const editing = viewModel.editing;
  const name = $('.ivp-name');
  const title = $('.ivp-title');
  const slug = $('.ivp-slug');
  const typingNameSlowly = raf.bind(null, debounce(typingName, 100));
  const typingTitleSlowly = raf.bind(null, debounce(typingTitle, 100));
  const typingSlugSlowly = raf.bind(null, debounce(typingSlug, 100));
  let boundSlug = !editing;
  let boundTitle = !editing;

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
