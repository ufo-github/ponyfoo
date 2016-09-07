'use strict';

const _ = require(`lodash`);
const url = require(`url`);
const util = require(`util`);
const moment = require(`moment`);
const cheerio = require(`cheerio`);
const minifyHtml = require(`html-minifier`).minify;
const env = require(`../lib/env`);
const authority = env(`AUTHORITY`);
const minifierOptions = {
  collapseWhitespace: true,
  conservativeCollapse: true
};
const imageCache = {};

function absolutize (html) {
  if (!html) {
    return html;
  }
  const $ = cheerio.load(html);

  $(`a[href]`).each(resolve(`href`));
  $(`img[src]`).each(resolve(`src`));
  $(`iframe[src]`).each(resolve(`src`));
  $(`script[src]`).each(resolve(`src`));
  $(`link[href]`).each(resolve(`href`));

  const absolute = $.html();
  const undeferred = undeferImages(absolute); // undo deferred image sources
  return undeferred;

  function resolve (prop) {
    return function each () {
      const elem = $(this);
      const href = elem.attr(prop);
      const absolute = url.resolve(authority, href);
      elem.attr(prop, absolute);
    };
  }
}

function fresh (item) {
  return item && moment.utc().isBefore(item.expires);
}

function extractImages (key, html, extras) {
  if (fresh(imageCache[key])) {
    return imageCache[key].value.slice();
  }
  const $ = cheerio.load(html);
  const images = $(`img[src]`).map(src);
  const result = _(images).filter(notEmoji).concat(extras || []).uniq().compact().value();

  imageCache[key] = {
    value: result.slice(),
    expires: moment.utc().add(6, `hours`)
  };

  return result;

  function src () {
    return $(this).attr(`src`);
  }
}

function isEmoji (src) {
  return src.indexOf(`https://twemoji.maxcdn.com/`) === 0;
}

function notEmoji (src) {
  return !isEmoji(src);
}

function isEmojiEl ($) {
  return (i, el) => isEmoji($(el).attr(`src`));
}

function fixedEmojiSize (html) {
  const $ = cheerio.load(html);
  $(`img[src]`).filter(isEmojiEl($)).css({
    width: `1em`,
    height: `1em`,
    margin: `0 0.05em 0 0.1em`,
    'vertical-align': `-0.1em`
  });
  return $.html();
}

function removeEmoji (html) {
  const $ = cheerio.load(html);
  $(`img[src]`).filter(isEmojiEl($)).remove();
  return $.html();
}

function downgradeEmojiImages (html) {
  const $ = cheerio.load(html);
  $(`img[src]`).filter(isEmojiEl($)).each(replace);
  return $.html();
  function replace (i, el) {
    const $el = $(el);
    $el.replaceWith($el.attr(`alt`));
  }
}

function getText (html) {
  return cheerio.load(html)(`*`).text();
}

function minify (html) {
  return minifyHtml(html, minifierOptions);
}

function deferImages (html, startIndex = 0) {
  if (!html) {
    return html;
  }
  const $ = cheerio.load(html);
  $(`img[src]`).each(defer);
  return $.html();

  function defer (i) {
    const elem = $(this);
    if (i < startIndex) {
      elem.parents(`figure`).addClass(`figure-has-loaded`);
      return;
    }
    const fallback = util.format(`<noscript>%s</noscript>`, $.html(elem));
    elem.attr(`data-src`, elem.attr(`src`));
    elem.addClass(`js-only`);
    elem.removeAttr(`src`);
    elem.after(fallback);
  }
}

function undeferImages (html) {
  if (!html) {
    return html;
  }
  const $ = cheerio.load(html);
  $(`img[data-src]`).each(undefer);
  return $.html();

  function undefer () {
    const elem = $(this);
    elem.attr(`src`, elem.attr(`data-src`));
    elem.removeClass(`js-only`);
    elem.removeAttr(`data-src`);
    elem.next(`noscript`).remove();
  }
}

function externalizeLinks (html) {
  if (!html) {
    return html;
  }
  const $ = cheerio.load(html);
  $(`a[href]`).attr(`target`, `_blank`);
  $(`a[href]`).attr(`rel`, `nofollow`);
  return $.html();
}

function linkThrough (html, mapper) {
  if (!html) {
    return html;
  }
  const $ = cheerio.load(html);
  $(`a[href]`).each(update);
  return $.html();
  function update () {
    const elem = $(this);
    const href = elem.attr(`href`);
    elem.attr(`href`, mapper(href));
  }
}

module.exports = {
  absolutize,
  extractImages,
  getText,
  minify,
  deferImages,
  undeferImages,
  externalizeLinks,
  fixedEmojiSize,
  removeEmoji,
  downgradeEmojiImages,
  linkThrough
};
