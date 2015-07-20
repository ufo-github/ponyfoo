'use strict';

var megamark = require('megamark');
var textService = require('./text');
var domains = [
  'http://codepen.io/',
  'http://jsbin.com/',
  'http://jsfiddle.net/',
  'http://embed.plnkr.co/'
];

megamark.parser.renderer.rules.link_open = link;

module.exports = {
  compile: compile
};

function getLabel (title) {
  var trimmedTitle = title ? title.trim() : '';
  if (trimmedTitle) {
    return textService.format(' aria-label="%s"', trimmedTitle);
  }
  return '';
}

function link (tokens, i) {
  var fmt = '<a href="%s"%s>';
  var open = tokens[i];
  var html = textService.format(fmt, open.href, getLabel(open.title));
  return html;
}

function filter (token) {
  return token.tag !== 'iframe' || domains.some(starts);
  function starts (beginning) {
    return token.attrs.src.indexOf(beginning) === 0;
  }
}

function compile (text) {
  return megamark(text, { filter: filter });
}
