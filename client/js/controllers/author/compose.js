'use strict';

var $ = require('dominus');
var moment = require('moment');
var raf = require('raf');
var taunus = require('taunus');
var flexarea = require('flexarea');
var ponymark = require('ponymark');
var rome = require('rome/src/rome.standalone');
var textService = require('../../../../services/text');

module.exports = function () {
  var title = $('.ac-title');
  var slug = $('.ac-slug');
  var texts = $('.ac-text');
  var introduction = $('.ac-introduction');
  var body = $('.ac-body');
  var tags = $('.ac-tags');
  var schedule = $('.ac-schedule');
  var publication = $('.ac-publication');
  var preview = $.findOne('.ac-preview');
  var previewTitle = $('.ac-preview-title');
  var previewTags = $.findOne('.ac-preview-tags');
  var discardButton = $('.ac-discard');
  var saveButton = $('.ac-save');
  var status = $('.ac-status');
  var boundSlug = true;

  texts.forEach(function (text) {
    ponymark({ buttons: text, input: text, preview: preview });
  });
  texts.find('.pmk-input').forEach(flexarea);
  rome(publication[0], {
    appendTo: 'parent',
    initialValue: moment().weekday(7)
  });
  tags.on('keypress keydown paste', raf.bind(null, updateTags));
  title.on('keypress keydown paste', raf.bind(null, bindTitle));
  slug.on('keypress keydown', unbindSlug);
  discardButton.on('click', discard);
  saveButton.on('click', save);
  status.on('change', updateSaveButton);
  schedule.on('change', updateSaveButton);

  function updateSaveButton () {
    var scheduled = schedule.value();
    if (scheduled) {
      saveButton.text('Schedule');
      saveButton.attr('aria-label', 'Schedule this article for publication');
      return;
    }
    var state = status.where(':checked').text();
    if (state === 'draft') {
      saveButton.text('Save Draft');
      saveButton.attr('aria-label', 'You can access your drafts at any time');
    } else if (state === 'publish') {
      saveButton.text('Publish');
      saveButton.attr('aria-label', 'Make the content immediately accessible!');
    }
  }

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

  function getRequestBody () {
    var individualTags = textService.splitTags(tags.value());
    var scheduled = schedule.value();
    var state = status.where(':checked').value();
    var body = {
      title: title.value(),
      slug: slug.value(),
      introduction: introduction.value(),
      body: body.value(),
      tags: individualTags,
      status: state
    };
    if (scheduled) {
      body.publication = publication.value();
    }
    return body;
  }

  function save () {
    var body = getRequestBody();
    send(body);
  }

  function send (body) {
    console.log('I should put', body);
  }

  function discard () {
    console.log('I should discard the draft and redirect. Or just redirect if not stored in server');
  }
};
