'use strict';

var megamark = require('megamark');
var insane = require('insane');
var textService = require('./text');
var domains = [
  '//codepen.io/',
  '//assets.codepen.io/',
  'http://codepen.io/',
  'http://assets.codepen.io/'
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
  console.log(token)
  var unsourced = token.tag !== 'iframe' && token.tag !== 'script';
  return unsourced || domains.some(starts);
  function starts (beginning) {
    return token.attrs.src.indexOf(beginning) === 0;
  }
}

function compile (text) {
  return megamark(text, {
    sanitizer: {
      filter: filter,
      allowedTags: insane.defaults.allowedTags.concat('iframe', 'script'),
      allowedAttributes: {
        script: ['src', 'async']
      }
    }
  });
}
