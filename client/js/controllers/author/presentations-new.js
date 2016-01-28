'use strict';

var $ = require('dominus');
var raf = require('raf');
var rome = require('rome');
var sluggish = require('sluggish');
var debounce = require('lodash/function/debounce');
var loadScript = require('../../lib/loadScript');

module.exports = function (viewModel, container) {
  var presented = $.findOne('.apn-presented');
  var title = $('.apn-title');
  var slug = $('.apn-slug');
  var actions = $('.apn-actions');
  var resources = $('.apn-resources').clone();
  var addResource = $('.apn-add-resource');
  var boundSlug = true;

  loadScript('/js/rome.js', function () {
    var updateSlugSlowly = raf.bind(null, debounce(updateSlug, 100));

    rome(presented, { time: false, inputFormat: 'DD-MM-YYYY' });

    slugUpdates('on');
    slug.once('keypress keydown paste input', unbindSlug);
    addResource.on('click', addResourceElements);

    function slugUpdates (direction) {
      title[direction]('keypress keydown paste input', updateSlugSlowly);
    }
    function unbindSlug () {
      slugUpdates('off');
    }
    function updateSlug () {
      slug.value(sluggish(title.value()));
    }
    function addResourceElements () {
      resources.clone().beforeOf(actions);
    }
  });
};
