'use strict';

var $ = require('dominus');
var raf = require('raf');
var convertToPonyEditor = require('../../lib/convertToPonyEditor');

module.exports = function (viewModel) {
  var title = $('.ec-title');
  var previewTitle = $('.ec-preview-title');
  var body = $('.ec-body');
  var preview = $.findOne('.ec-preview');
  var sendButton = $('.ec-send');

  convertToPonyEditor(body[0], preview);

  title.on('keypress keydown paste', raf.bind(null, updatePreviewTitle));
  sendButton.on('click', send);

  function updatePreviewTitle () {
    previewTitle.text(title.value());
  }

  function send () {
    viewModel.measly.post('/api/email', {
      json: {
        title: title.value(),
        body: body.value()
      }
    });
  }
};
