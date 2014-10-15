'use strict';

var $ = require('dominus');
var raf = require('raf');
var convertToPonyEditor = require('../../lib/convertToPonyEditor');

module.exports = function (viewModel) {
  var subject = $('.ec-subject');
  var teaser = $('.ec-teaser');
  var previewSubject = $('.ec-preview-subject');
  var previewTeaser = $('.ec-preview-teaser');
  var body = $('.ec-body');
  var preview = $.findOne('.ec-preview');
  var sendButton = $('.ec-send');

  convertToPonyEditor(body[0], preview);

  subject.on('keypress keydown paste', raf.bind(null, updatePreviewSubject));
  teaser.on('keypress keydown paste', raf.bind(null, updatePreviewTeaser));
  sendButton.on('click', send);

  function updatePreviewSubject () {
    previewSubject.text(subject.value());
  }

  function updatePreviewTeaser () {
    previewTeaser.text(teaser.value());
  }

  function send () {
    viewModel.measly.post('/api/email', {
      json: {
        subject: subject.value(),
        teaser: teaser.value(),
        body: body.value()
      }
    });
  }
};
