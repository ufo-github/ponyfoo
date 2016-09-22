'use strict';

const omnibox = require(`omnibox`);
const domador = require(`domador`);
const megamark = require(`megamark`);
const implicitFigures = require(`markdown-it-implicit-figures`);
const implicitFiguresForTweets = require(`../lib/implicitFiguresForTweets`);
const insane = require(`insane`);
const textService = require(`./text`);
const emojiService = require(`./emoji`);
const env = require(`../lib/env`);
const authority = env(`AUTHORITY`);
const domains = [
  /^(https?:)?\/\/codepen\.io\//i,
  /^(https?:)?\/\/assets\.codepen\.io\//i,
  /^https:\/\/www\.youtube\.com\//i,
  /^https:\/\/player\.vimeo\.com\//i
];
const rlang = /md-lang-((?:[^\s]|$)+)/;

megamark.parser.renderer.rules.link_open = link;
megamark.parser.use(implicitFigures, { figcaption: true });
megamark.parser.use(implicitFiguresForTweets);

module.exports = { compile, decompile };

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
  let i = 0;
  const len = token.attrs.length;
  for (; i < len; i++) {
    if (token.attrs[i][0] === name) {
      return token.attrs[i][1];
    }
  }
  return null;
}

function setLabel (attrs, title) {
  const trimmedTitle = title ? title.trim() : ``;
  if (trimmedTitle) {
    attrs[`aria-label`] = trimmedTitle;
  }
}

function blankTarget (attrs, href) {
  const parts = omnibox.parse(href);
  const difforigin = parts.host && parts.host !== authority;
  if (difforigin) {
    attrs.target = `_blank`;
  }
}

function stringifyLink (attrs) {
  return Object.keys(attrs).reduce(reducer, `<a`) + `>`;
  function reducer (all, attr) {
    return all + textService.format(` %s="%s"`, attr, attrs[attr]);
  }
}

function link (tokens, i) {
  const open = tokens[i];
  const href = attr(open, `href`);
  const title = attr(open, `title`);
  const attrs = { href: href };
  blankTarget(attrs, href);
  setLabel(attrs, title);
  return stringifyLink(attrs);
}

function filter (token) {
  const unsourced = token.tag !== `iframe` && token.tag !== `script`;
  return unsourced || startsWithValidDomain(attr(token, `src`));
}

function startsWithValidDomain (href) {
  return domains.some(starts);
  function starts (reg) {
    return href && reg.test(href);
  }
}

function compile (text) {
  const mdOpts = {
    sanitizer: {
      filter: filter,
      allowedTags: insane.defaults.allowedTags.concat(`iframe`, `script`, `figure`, `figcaption`),
      allowedAttributes: {
        script: [`src`, `async`],
        p: [`data-height`, `data-theme-id`, `data-slug-hash`, `data-default-tab`, `data-user`],
        iframe: [`src`, `width`, `height`, `webkitallowfullscreen`, `mozallowfullscreen`, `allowfullscreen`]
      },
      allowedClasses: {
        div: [
          `mde-text-left`,
          `mde-text-center`,
          `mde-text-right`,
          `mde-clearfix`,
          `mde-quote`,
          `mde-core`,
          `mde-mono`,
          `mde-heading`,
          `mde-subheading`,
          `mde-inline`,
          `mde-left`,
          `mde-right`,
          `mde-pad-0`,
          `mde-pad-5`,
          `mde-pad-10`,
          `mde-pad-15`,
          `mde-pad-20`,
          `mde-pad-25`,
          `mde-pad-30`,
          `mde-pad-50`,
          `mde-mar-0`,
          `mde-mar-5`,
          `mde-mar-10`,
          `mde-mar-15`,
          `mde-mar-20`,
          `mde-mar-25`,
          `mde-mar-30`,
          `mde-mar-50`,
          `mde-20`,
          `mde-25`,
          `mde-33`,
          `mde-50`,
          `mde-66`,
          `mde-75`
        ],
        p: [`codepen`],
        blockquote: [`twitter-tweet`],
        figure: [`twitter-tweet-figure`],
        img: [`tj-emoji`]
      }
    }
  };
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
    allowFrame: allowFrame,
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

  function allowFrame (src) {
    return startsWithValidDomain(src);
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
