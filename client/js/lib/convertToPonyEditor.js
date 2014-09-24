'use strict';

var $ = require('dominus');
var flexarea = require('flexarea');
var ponymark = require('ponymark');
var twitterService = require('./twitter');

function convertToPonyEditor (textarea, preview) {
  var pony = ponymark({ textarea: textarea, preview: preview });
  var ta = $(textarea);
  var md = ta.attr('data-markdown');
  if (md) {
    ta.value(md);
  }
  flexarea(textarea);
  pony.on('refresh', tweets);
  return pony;

  function tweets () {
    twitterService.updateView(preview);
  }
}

module.exports = convertToPonyEditor;
