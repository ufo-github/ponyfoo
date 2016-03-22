'use strict';

var _ = require('lodash');
var htmlService = require('./html');
var markdownService = require('./markdown');

function compile (md, options) {
  var methods = [];
  var o = options || {};

  add(o.linkThrough, linkThrough);
  add(o.minify !== false, htmlService.minify);
  add(o.absolutize, htmlService.absolutize);
  add(o.deferImages, deferImages);
  add(o.externalize, htmlService.externalizeLinks);
  add(o.markdown !== false, markdownService.compile);

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

module.exports = {
  compile: compile
};
