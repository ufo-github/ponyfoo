'use strict';

var $ = require('dominus');
var taunus = require('taunus');
var convertToPonyEditor = require('../../lib/convertToPonyEditor');

module.exports = function (viewModel, route) {
  var container = $.findOne('.cb-bio');
  var preview = $.findOne('.cb-preview');
  var saveButton = $('.cb-save');
  var bio;

  convertToPonyEditor(container, preview);
  bio = $('.cb-bio .pmk-input');

  saveButton.on('click', save);

  function save () {
    var md = bio.value();
    var data = {
      json: { bio: md }
    };
    viewModel.measly.patch('/api/account/bio', data).on('data', leave);
  }

  function leave () {
    taunus.navigate('/');
  }
};
