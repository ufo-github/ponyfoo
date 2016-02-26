'use strict';

var $ = require('dominus');
var raf = require('raf');
var taunus = require('taunus');
var debounce = require('lodash/function/debounce');
var markdownService = require('../../../../services/markdown');
var rparagraph = /^<p>|<\/p>$/ig;

module.exports = function (viewModel, container) {
  var editor = $('.cb-bio', container);
  var preview = $('.cb-preview', container);
  var saveButton = $('.cb-save', container);
  var bioSidebar = $('.de-bio', container);

  editor.on('keypress keydown paste input', raf.bind(null, debounce(updatePreview, 200)));
  saveButton.on('click', save);
  updatePreview();

  function updatePreview () {
    preview.html(getHtml(editor).trim().replace(rparagraph, '') || 'Main body of your bio');
  }

  function getHtml (el) { return markdownService.compile(el.value()); }

  function save () {
    var md = editor.value();
    var data = {
      json: { bio: md }
    };
    viewModel.measly.patch('/api/account/bio', data).on('data', leave);

    function leave () {
      var html = markdownService.compile(md);
      bioSidebar.html(html);
      taunus.navigate('/');
    }
  }
};
