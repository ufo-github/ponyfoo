'use strict';

var $ = require('dominus');
var taunus = require('taunus/global');
var markdownService = require('../../../../services/markdown');

module.exports = function (viewModel, container) {
  var editor = $('.cb-bio', container);
  var preview = $.findOne('.cb-preview', container);
  var saveButton = $('.cb-save', container);
  var bioSidebar = $('.de-bio', container);

  saveButton.on('click', save);

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
