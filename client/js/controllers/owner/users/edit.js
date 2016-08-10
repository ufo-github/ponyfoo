'use strict';

var $ = require('dominus');
var raf = require('raf');
var taunus = require('taunus');
var sluggish = require('sluggish');
var debounce = require('lodash/debounce');
var markdownService = require('../../../../../services/markdown');

module.exports = function (viewModel, container) {
  var email = $('.cb-email', container);
  var oldPassword = $('.cb-old-password', container);
  var password = $('.cb-password', container);
  var displayName = $('.cb-name', container);
  var slug = $('.cb-slug', container);
  var bio = $('.cb-bio', container);
  var twitter = $('.cb-twitter', container);
  var website = $('.cb-website', container);
  var preview = $('.cb-preview', container);
  var avatar = $('.cb-avatar', container);
  var roles = $('.cb-role-input', container);
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
    var rparagraph = /^<p>|<\/p>$/ig;
    preview.html(getHtml(bio).trim().replace(rparagraph, '') || 'Main body of your bio');
  }

  function getHtml (el) {
    return markdownService.compile(el.value());
  }

  function save () {
    var model = {
      email: email.value(),
      displayName: displayName.value(),
      slug: sluggish(slug.value()),
      bio: bio.value(),
      twitter: twitter.value(),
      website: website.value(),
      avatar: avatar.value(),
      roles: roles.filter(isChecked).map(intoRoleValue)
    };
    var pwd = password.value();
    if (pwd.length) {
      model.password = pwd;
      if (viewModel.editing) {
        model.oldPassword = oldPassword.value();
      }
    }
    var data = { json: model };
    var id = saveButton.attr('data-id');
    if (viewModel.editing) {
      viewModel.measly.patch('/api/users/' + id, data).on('data', leave);
    } else {
      viewModel.measly.put('/api/users', data).on('data', leave);
    }

    function leave () {
      taunus.navigate('/users');
    }

    function isChecked (el) { return $(el).value(); }
    function intoRoleValue (el) { return $(el).text(); }
  }
};
