'use strict';

var _ = require('lodash');
var gemoji = require('gemoji');
var htmlService = require('./html');
var markdownService = require('./markdown');

function compile (md, options) {
  var methods = [];
  var o = options || {};

  add(o.linkThrough, linkThrough);
  add(o.minify !== false, htmlService.minify);
  add(o.removeEmoji, htmlService.removeEmoji);
  add(o.fixEmojiSize, htmlService.fixedEmojiSize);
  add(o.absolutize, htmlService.absolutize);
  add(o.deferImages, deferImages);
  add(o.externalize, htmlService.externalizeLinks);
  add(o.markdown !== false, markdownService.compile);
  add(o.markdown !== false, emojify);

  var composite = _.compose.apply(_, methods);
  var html = composite(md);
  return html;

  function add (conditional, fn) {
    if (conditional) { methods.push(fn); }
  }

  function deferImages (html) {
    var i = typeof o.deferImages === 'number' && o.deferImages;
    return htmlService.deferImages(html, i);
  }

  function linkThrough (html) {
    return htmlService.linkThrough(html, o.linkThrough);
  }
}

function emojify (input) {
  var remoji = /:([a-z_-]+):/ig;
  return input.replace(remoji, emojifyInput);
  function emojifyInput (all, name) {
    var data = gemoji.name[name];
    if (data) {
      return data.emoji;
    }
    return all;
  }
}

module.exports = {
  compile: compile
};
