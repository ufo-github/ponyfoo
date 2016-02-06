'use strict';

var twemoji = require('twemoji');
var domador = require('domador');
var megamark = require('megamark');
var insane = require('insane');
var textService = require('./text');
var env = require('../lib/env');
var authority = env('AUTHORITY');
var domains = [
  /^(https?:)?\/\/codepen.io\//i,
  /^(https?:)?\/\/assets.codepen.io\//i
];

megamark.parser.renderer.rules.link_open = link;

module.exports = {
  compile: compile,
  decompile: decompile
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
  if (!token.attrs) {
    return null;
  }
  if (token.attrs[name]) {
    return token.attrs[name];
  }
  var i = 0;
  var len = token.attrs.length;
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
  return unsourced || startsWithValidDomain(attr(token, 'src'));
}

function startsWithValidDomain (href) {
  return domains.some(starts);
  function starts (reg) {
    return href && reg.test(href);
  }
}

function compile (text) {
  var mdOpts = {
    sanitizer: {
      filter: filter,
      allowedTags: insane.defaults.allowedTags.concat('iframe', 'script'),
      allowedAttributes: {
        script: ['src', 'async'],
        p: ['data-height', 'data-theme-id', 'data-slug-hash', 'data-default-tab', 'data-user']
      },
      allowedClasses: {
        p: ['codepen'],
        blockquote: ['twitter-tweet'],
        img: ['tj-emoji']
      }
    }
  };
  var emojiOpts = {
    base: 'https://twemoji.maxcdn.com/',
    className: 'tj-emoji',
    size: 72
  };
  return twemoji.parse(megamark(text, mdOpts), emojiOpts);
}

function decompile (html, options) {
  var langmap = {
    javascript: 'js',
    markdown: 'md'
  };
  var o = options || {};
  return domador(html, {
    href: o.href || authority,
    absolute: true,
    fencing: true,
    fencinglanguage: function (el) {
      if (el.tagName === 'PRE') {
        el = el.firstChild;
      }
      var match = el.className.match(/md-lang-((?:[^\s]|$)+)/);
      if (!match) {
        return;
      }
      var lang = match.pop();
      return langmap[lang] || lang;
    },
    allowFrame: function (src) {
      return startsWithValidDomain(src);
    },
    transform: function (el) {
      if (el.tagName === 'IMG' && el.className === 'tj-emoji' && el.alt) {
        return el.alt;
      }
      if (o.plain === true) {
        return el.textContent || el.innerText || '';
      }
      if (el.tagName === 'BLOCKQUOTE' && el.className === 'twitter-tweet') {
        return el.outerHTML;
      }
    }
  });
}
