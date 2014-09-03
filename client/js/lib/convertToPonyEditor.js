'use strict';

var $ = require('dominus');
var flexarea = require('flexarea');
var ponymark = require('ponymark');
var twitterService = require('./twitter');

function convertToPonyEditor (elem, preview) {
  var container = $(elem);
  var pony = ponymark({ buttons: elem, input: elem, preview: preview });
  var editor = container.find('.pmk-input');
  editor.value(container.attr('data-markdown'));
  flexarea(editor[0]);
  pony.on('refresh', tweets);
  return pony;

  function tweets () {
    twitterService.updateView(preview);
  }
}

module.exports = convertToPonyEditor;
