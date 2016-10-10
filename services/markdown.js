'use strict';

const omnibox = require(`omnibox`);
const domador = require(`domador`);
const megamark = require(`megamark`);
const implicitFigures = require(`markdown-it-implicit-figures`);
const textService = require(`./text`);
const emojiService = require(`./emoji`);
const markdownSanitizer = require(`./markdownSanitizer`);
const implicitFiguresForTweets = require(`../lib/implicitFiguresForTweets`);
const customMarkdownContainers = require(`../lib/customMarkdownContainers`);
const env = require(`../lib/env`);
const authority = env(`AUTHORITY`);
const rlang = /md-lang-((?:[^\s]|$)+)/;
const rshortlink = /^\/(s|bf)(\/|$)/i;

megamark.parser.renderer.rules.link_open = link_open;
megamark.parser.use(implicitFigures, { figcaption: true });
megamark.parser.use(implicitFiguresForTweets);
customMarkdownContainers.setup(megamark.parser);

module.exports = { compile, decompile };

function setLabel (attrs, title) {
  const trimmedTitle = title ? title.trim() : ``;
  if (trimmedTitle) {
    attrs[`aria-label`] = trimmedTitle;
  }
}

function blankTarget (attrs, href) {
  const parts = omnibox.parse(href);
  const mightBeExternal = mayBeExternal(parts);
  if (mightBeExternal) {
    attrs.target = `_blank`;
  }
}

function mayBeExternal (parts) {
  const difforigin = parts.host && parts.host !== authority;
  if (difforigin) {
    return true;
  }
  const shortlinked = rshortlink.test(parts.path);
  if (shortlinked) {
    return true;
  }
  return false;
}

function stringifyLink (attrs) {
  return Object.keys(attrs).reduce(reducer, `<a`) + `>`;
  function reducer (all, attr) {
    return all + textService.format(` %s="%s"`, attr, attrs[attr]);
  }
}

function link_open (tokens, i) {
  const open = tokens[i];
  const href = markdownSanitizer.attr(open, `href`);
  const title = markdownSanitizer.attr(open, `title`);
  const attrs = { href: href };
  blankTarget(attrs, href);
  setLabel(attrs, title);
  return stringifyLink(attrs);
}

function compile (text) {
  const mdOpts = { sanitizer: markdownSanitizer.options };
  const html = megamark(text, mdOpts);
  return emojiService.compile(html);
}

function decompile (html, options) {
  const langmap = {
    javascript: `js`,
    markdown: `md`
  };
  const o = options || {};
  const domadorOpts = {
    href: o.href || authority,
    absolute: true,
    fencing: true,
    fencinglanguage: fencinglanguage,
    allowFrame: markdownSanitizer.startsWithValidDomain,
    transform: transform
  };
  const decompiled = domador(html, domadorOpts);
  if (o.plain !== true) {
    return decompiled;
  }
  const rspaces = /\s+/g;
  return decompiled.replace(rspaces, ` `).trim();

  function fencinglanguage (el) {
    if (el.tagName === `PRE`) {
      el = el.firstChild;
    }
    const match = el.className.match(rlang);
    if (!match) {
      return;
    }
    const lang = match.pop();
    return langmap[lang] || lang;
  }

  function transform (el) {
    if (el.tagName === `IMG` && el.className === `tj-emoji` && el.alt) {
      return el.alt;
    }
    if (o.plain === true) {
      return plain();
    }
    if (el.tagName === `BLOCKQUOTE` && el.className === `twitter-tweet`) {
      return el.outerHTML;
    }

    function plain () {
      const content = el.textContent || el.innerText || ``;
      const blocks = [`DIV`, `P`, `BLOCKQUOTE`, `PRE`];
      const block = blocks.indexOf(el.tagName) !== -1;
      if (block) {
        return ` ` + content + ` `;
      }
      return content;
    }
  }
}
