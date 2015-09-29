'use strict';

var $ = require('dominus');
var taunus = require('taunus/global');
var markdownService = require('../../../../services/markdown');

module.exports = function (viewModel) {
  var editor = $('.cb-bio');
  var preview = $.findOne('.cb-preview');
  var saveButton = $('.cb-save');
  var bioSidebar = $('.de-bio');

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
