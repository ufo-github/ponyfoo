'use strict';

var $ = require('dominus');
var flexarea = require('flexarea');
var ponymark = require('ponymark');
var twitterService = require('./twitter');

function convertToPonyEditor (textarea, preview) {
  var pony = ponymark({ textarea: textarea, preview: preview });
  textarea.value(textarea.attr('data-markdown'));
  flexarea(textarea);
  pony.on('refresh', tweets);
  return pony;

  function tweets () {
    twitterService.updateView(preview);
  }
}

module.exports = convertToPonyEditor;
