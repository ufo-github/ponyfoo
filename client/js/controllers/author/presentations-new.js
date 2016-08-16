'use strict';

const $ = require(`dominus`);
const raf = require(`raf`);
const sluggish = require(`sluggish`);
const debounce = require(`lodash/debounce`);
const loadScript = require(`../../lib/loadScript`);

module.exports = function () {
  const presented = $.findOne(`.apn-presented`);
  const title = $(`.apn-title`);
  const slug = $(`.apn-slug`);
  const actions = $(`.apn-actions`);
  const resources = $(`.apn-resources`).clone();
  const addResource = $(`.apn-add-resource`);

  loadScript(`/js/rome.js`, function loaded () {
    const rome = global.rome;
    const updateSlugSlowly = raf.bind(null, debounce(updateSlug, 100));

    rome(presented, { time: false, inputFormat: `DD-MM-YYYY` });

    slugUpdates(`on`);
    slug.once(`keypress keydown paste input`, unbindSlug);
    addResource.on(`click`, addResourceElements);

    function slugUpdates (direction) {
      title[direction](`keypress keydown paste input`, updateSlugSlowly);
    }
    function unbindSlug () {
      slugUpdates(`off`);
    }
    function updateSlug () {
      slug.value(sluggish(title.value()));
    }
    function addResourceElements () {
      resources.clone().beforeOf(actions);
    }
  });
};
