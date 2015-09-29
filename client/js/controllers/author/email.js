'use strict';

var $ = require('dominus');
var raf = require('raf');
var taunus = require('taunus/global');

module.exports = function (viewModel) {
  var subject = $('.ec-subject');
  var teaser = $('.ec-teaser');
  var previewSubject = $('.ec-preview-subject');
  var previewTeaser = $('.ec-preview-teaser');
  var body = $('.ec-body');
  var preview = $.findOne('.ec-preview');
  var sendButton = $('.ec-send');

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
    var model = {
      json: {
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
