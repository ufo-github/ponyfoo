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

function attr (token, name) {
  if (token[name]) {
    return token[name];
  }
  var i = 0;
  var len = token.attrs ? token.attrs.length : 0;
  for (; i < len; i++) {
    if (token.attrs[i][0] === name) {
      return token.attrs[i][1];
    }
  }
  return null;
}

function link (tokens, i) {
  var fmt = '<a href="%s"%s>';
  var open = tokens[i];
  var href = attr(open, 'href');
  var title = attr(open, 'title');
  var html = textService.format(fmt, href, getLabel(title));
  return html;
}

function filter (token) {
  var unsourced = token.tag !== 'iframe' && token.tag !== 'script';
  return unsourced || domains.some(starts);
  function starts (beginning) {
    var src = attr(token, 'src');
    return src && src.indexOf(beginning) === 0;
  }
}

function compile (text) {
  return megamark(text, {
    sanitizer: {
      filter: filter,
      allowedTags: insane.defaults.allowedTags.concat('iframe', 'script'),
      allowedAttributes: {
        script: ['src', 'async'],
        p: ['data-height', 'data-theme-id', 'data-slug-hash', 'data-default-tab', 'data-user']
      },
      allowedClasses: {
        p: ['codepen']
      }
    }
  });
}
