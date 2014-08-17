'use strict';

var $ = require('dominus');
var throttle = require('lodash.throttle');
var moment = require('moment');
var raf = require('raf');
var taunus = require('taunus');
var flexarea = require('flexarea');
var ponymark = require('ponymark');
var rome = require('rome/src/rome.standalone');
var textService = require('../../../../services/text');
var storage = require('../../lib/storage');
var key = 'author-unsaved-draft';

module.exports = function (viewModel) {
  var title = $('.ac-title');
  var slug = $('.ac-slug');
  var texts = $('.ac-text');
  var tags = $('.ac-tags');
  var schedule = $('.ac-schedule');
  var publication = $('.ac-publication');
  var preview = $.findOne('.ac-preview');
  var previewTitle = $('.ac-preview-title');
  var previewTags = $.findOne('.ac-preview-tags');
  var discardButton = $('.ac-discard');
  var saveButton = $('.ac-save');
  var status = $('.ac-status');
  var statusRadio = {
    draft: $('#ac-draft-radio'),
    publish: $('#ac-publish-radio')
  };
  var ponies = [];
  var boundSlug = true;
  var intro;
  var body;
  var publicationCal;
  var initialDate;
  var serializeSlowly = throttle(serialize, 200);

  texts.forEach(convertToPonyEditor);
  texts.on('keypress keydown paste', serializeSlowly);
  tags.on('keypress keydown paste', raf.bind(null, typingTags));
  title.on('keypress keydown paste', raf.bind(null, typingTitle));
  slug.on('keypress keydown paste', typingSlug);
  discardButton.on('click', discard);
  saveButton.on('click', save);
  status.on('change', changePublication);
  schedule.on('change', changePublication);

  intro = $('.ac-introduction .pmk-input');
  body = $('.ac-body .pmk-input');

  deserialize();

  publicationCal = rome(publication[0], {
    appendTo: 'parent',
    initialValue: initialDate || moment().weekday(7),
    required: true
  });
  publicationCal.on('data', serializeSlowly);

  function convertToPonyEditor (text) {
    var pony = ponymark({ buttons: text, input: text, preview: preview });
    ponies.push(pony);
    flexarea($(text).findOne('.pmk-input'));
  }

  function changePublication () {
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
    serializeSlowly();
  }

  function typingTitle () {
    if (boundSlug) {
      updateSlug();
    }
    updatePreviewTitle();
    serializeSlowly();
  }

  function typingSlug () {
    boundSlug = false;
    serializeSlowly();
  }

  function updateSlug () {
    slug.value(textService.slug(title.value()));
  }

  function updatePreviewTitle () {
    previewTitle.text(title.value());
  }

  function typingTags () {
    updatePreviewTags();
    serializeSlowly();
  }

  function updatePreviewTags () {
    var individualTags = textService.splitTags(tags.value());
    var model = {
      tags: individualTags
    };
    taunus.partial(previewTags, 'partials/tags', model);
  }

  function updatePreviewMarkdown () {
    ponies.forEach(function refresh (pony) {
      pony.refresh();
    });
  }

  function serialize () { storage.set(key, getRequestData()); }
  function clear () { storage.remove(key); }

  function deserialize () {
    var data = storage.get(key) || {};

    title.value(data.title || '');
    slug.value(data.slug || '');
    intro.value(data.introduction || '');
    body.value(data.body || '');
    tags.value((data.tags || []).join(' '));
    statusRadio[data.status || 'publish'].value(true);

    if ('publication' in data) {
      schedule.value(true);
      initialDate = moment(data.publication);
    }

    updatePreviewTitle();
    updatePreviewTags();
    updatePreviewMarkdown();
  }

  function getRequestData () {
    var individualTags = textService.splitTags(tags.value());
    var scheduled = schedule.value();
<<<<<<< HEAD
    var state = status.where(':checked').value();
    var body = {
=======
    var status = $('.ac-status:checked').text();
    var data = {
>>>>>>> persist drafts locally to prevent data loss
      title: title.value(),
      slug: slug.value(),
      introduction: intro.value(),
      body: body.value(),
      tags: individualTags,
      status: state
    };
    if (scheduled) {
      data.publication = publicationCal.getMoment().zone(0).format();
    }
    return data;
  }

  function save () {
    var data = getRequestData();
    send(data);
  }

  function send (data) {
    var req = viewModel.measly.put('/api/articles', { json: data });
    // req.on('data', );
    // TODO clear();
  }

  function discard () {
    console.log('I should discard the draft and redirect. Or just redirect if not stored in server');
    clear();
    deserialize();
  }
};
