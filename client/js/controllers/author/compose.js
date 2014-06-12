'use strict';

var $ = require('dominus');
var flexarea = require('flexarea');
var ponymark = require('ponymark');

module.exports = function () {
  var texts = $('.ac-text');
  var preview = $('.ac-preview');

  texts.forEach(function (text) {
    ponymark({ buttons: text, input: text, preview: preview });
  });
  texts.find('.pmk-input').forEach(flexarea);
};
