'use strict';

const $ = require(`dominus`);
const raf = require(`raf`);
const taunus = require(`taunus`);
const sluggish = require(`sluggish`);
const debounce = require(`lodash/debounce`);
const markdownService = require(`../../../../../services/markdown`);

module.exports = function (viewModel, container) {
  const email = $(`.cb-email`, container);
  const oldPassword = $(`.cb-old-password`, container);
  const password = $(`.cb-password`, container);
  const displayName = $(`.cb-name`, container);
  const slug = $(`.cb-slug`, container);
  const bio = $(`.cb-bio`, container);
  const twitter = $(`.cb-twitter`, container);
  const website = $(`.cb-website`, container);
  const preview = $(`.cb-preview`, container);
  const avatar = $(`.cb-avatar`, container);
  const roles = $(`.cb-role-input`, container);
  const saveButton = $(`.cb-save`, container);
  const updatePreviewSlowly = raf.bind(null, debounce(updatePreview, 200));
  const updateSlugSlowly = raf.bind(null, debounce(updateSlug, 200));

  displayName.on(`keypress keydown paste input`, updateSlugSlowly);
  slug.once(`keypress keydown paste input`, unbindSlug);
  bio.on(`keypress keydown paste input`, updatePreviewSlowly);
  saveButton.on(`click`, save);
  updatePreview();

  function unbindSlug () {
    displayName.off(`keypress keydown paste input`, updateSlugSlowly);
  }

  function updateSlug () {
    slug.value(sluggish(displayName.value()));
  }

  function updatePreview () {
    const rparagraph = /^<p>|<\/p>$/ig;
    preview.html(getHtml(bio).trim().replace(rparagraph, ``) || `Main body of your bio`);
  }

  function getHtml (el) {
    return markdownService.compile(el.value());
  }

  function save () {
    const model = {
      email: email.value(),
      displayName: displayName.value(),
      slug: sluggish(slug.value()),
      bio: bio.value(),
      twitter: twitter.value(),
      website: website.value(),
      avatar: avatar.value(),
      roles: roles.filter(isChecked).map(intoRoleValue)
    };
    const pwd = password.value();
    if (pwd.length) {
      model.password = pwd;
      if (viewModel.editing) {
        model.oldPassword = oldPassword.value();
      }
    }
    const data = { json: model };
    const id = saveButton.attr(`data-id`);
    if (viewModel.editing) {
      viewModel.measly.patch(`/api/users/` + id, data).on(`data`, leave);
    } else {
      viewModel.measly.put(`/api/users`, data).on(`data`, leave);
    }

    function leave () {
      taunus.navigate(`/users`);
    }

    function isChecked (el) { return $(el).value(); }
    function intoRoleValue (el) { return $(el).text(); }
  }
};
