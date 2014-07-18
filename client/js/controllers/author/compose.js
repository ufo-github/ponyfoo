'use strict';

var $ = require('dominus');
var raf = require('raf');
var taunus = require('taunus');
var flexarea = require('flexarea');
var ponymark = require('ponymark');
var rome = require('rome');
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
  var boundSlug = true;

  texts.forEach(function (text) {
    ponymark({ buttons: text, input: text, preview: preview });
  });
  texts.find('.pmk-input').forEach(flexarea);
  rome(publication[0], { appendTo: 'parent' });
  tags.on('keypress keydown paste', raf.bind(null, updateTags));
  title.on('keypress keydown paste', raf.bind(null, bindTitle));
  slug.on('keypress keydown', unbindSlug);
  discardButton.on('click', discard);
  saveButton.on('click', save);

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
    var scheduled = schedule.value();
    var tags = textService.splitTags(tags.value());
    var status = $('.ac-status:checked').value();
    var body = {
      title: title.value(),
      slug: slug.value(),
      introduction: introduction.value(),
      body: body.value(),
      tags: tags,
      status: status
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
