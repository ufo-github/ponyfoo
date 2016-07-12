'use strict';

var omnibox = require('omnibox');
var domador = require('domador');
var megamark = require('megamark');
var insane = require('insane');
var textService = require('./text');
var emojiService = require('./emoji');
var env = require('../lib/env');
var authority = env('AUTHORITY');
var domains = [
  /^(https?:)?\/\/codepen.io\//i,
  /^(https?:)?\/\/assets.codepen.io\//i
];
var rlang = /md-lang-((?:[^\s]|$)+)/;

megamark.parser.renderer.rules.link_open = link;

module.exports = {
  compile: compile,
  decompile: decompile
};

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

function setLabel (attrs, title) {
  var trimmedTitle = title ? title.trim() : '';
  if (trimmedTitle) {
    attrs['aria-label'] = trimmedTitle;
  }
}

function blankTarget (attrs, href) {
  var parts = omnibox.parse(href);
  var difforigin = parts.host && parts.host !== authority;
  if (difforigin) {
    attrs.target = '_blank';
  }
}

function stringifyLink (attrs) {
  return Object.keys(attrs).reduce(reducer, '<a') + '>';
  function reducer (all, attr) {
    return all + textService.format(' %s="%s"', attr, attrs[attr]);
  }
}

function link (tokens, i) {
  var open = tokens[i];
  var href = attr(open, 'href');
  var title = attr(open, 'title');
  var attrs = { href: href };
  blankTarget(attrs, href);
  setLabel(attrs, title);
  return stringifyLink(attrs);
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
  var html = megamark(text, mdOpts);
  return emojiService.compile(html);
}

function decompile (html, options) {
  var langmap = {
    javascript: 'js',
    markdown: 'md'
  };
  var o = options || {};
  var domadorOpts = {
    href: o.href || authority,
    absolute: true,
    fencing: true,
    fencinglanguage: fencinglanguage,
    allowFrame: allowFrame,
    transform: transform
  };
  var decompiled = domador(html, domadorOpts);
  if (o.plain !== true) {
    return decompiled;
  }
  var rspaces = /\s+/g;
  return decompiled.replace(rspaces, ' ').trim();

  function fencinglanguage (el) {
    if (el.tagName === 'PRE') {
      el = el.firstChild;
    }
    var match = el.className.match(rlang);
    if (!match) {
      return;
    }
    var lang = match.pop();
    return langmap[lang] || lang;
  }

  function allowFrame (src) {
    return startsWithValidDomain(src);
  }

  function transform (el) {
    if (el.tagName === 'IMG' && el.className === 'tj-emoji' && el.alt) {
      return el.alt;
    }
    if (o.plain === true) {
      return plain();
    }
    if (el.tagName === 'BLOCKQUOTE' && el.className === 'twitter-tweet') {
      return el.outerHTML;
    }

    function plain () {
      var content = el.textContent || el.innerText || '';
      var blocks = ['DIV', 'P', 'BLOCKQUOTE', 'PRE'];
      var block = blocks.indexOf(el.tagName) !== -1;
      if (block) {
        return ' ' + content + ' ';
      }
      return content;
    }
  }
}
