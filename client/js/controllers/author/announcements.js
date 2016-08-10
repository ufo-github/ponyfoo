'use strict';

var $ = require('dominus');
var raf = require('raf');
var taunus = require('taunus');
var debounce = require('lodash/debounce');
var markdownService = require('../../../../services/markdown');

module.exports = function (viewModel) {
  var subject = $('.ec-subject');
  var teaser = $('.ec-teaser');
  var body = $('.ec-body');
  var topic = $('.ec-topic');
  var previewSubject = $('.ec-preview-subject');
  var previewTeaser = $('.ec-preview-teaser');
  var previewBody = $('.ec-preview-body');
  var sendButton = $('.ec-send');

  subject.on('keypress keydown paste', raf.bind(null, debounce(updatePreviewSubject, 200)));
  teaser.on('keypress keydown paste', raf.bind(null, debounce(updatePreviewTeaser, 200)));
  body.on('keypress keydown paste input', raf.bind(null, debounce(updatePreviewBody, 200)));
  sendButton.on('click', send);

  function updatePreviewSubject () {
    previewSubject.text(subject.value().trim() || 'Email Preview');
  }
  function updatePreviewTeaser () {
    previewTeaser.text(teaser.value() || 'Teaser about email contents');
  }
  function updatePreviewBody () {
    var rparagraph = /^<p>|<\/p>$/ig;
    previewBody.html(getHtml(body).trim().replace(rparagraph, '') || 'Main body of your email');
  }

  function getHtml (el) { return markdownService.compile(el.value()); }

  function send () {
    var model = {
      json: {
        topic: topic.value(),
        subject: subject.value(),
        teaser: teaser.value(),
        body: body.value()
      }
    };
    viewModel.measly.post('/api/email', model).on('data', leave);
  }

  function leave () {
    taunus.navigate('/');
  }
};
