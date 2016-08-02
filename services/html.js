'use strict';

var _ = require('lodash');
var url = require('url');
var util = require('util');
var moment = require('moment');
var cheerio = require('cheerio');
var minifyHtml = require('html-minifier').minify;
var env = require('../lib/env');
var authority = env('AUTHORITY');
var minifierOptions = {
  collapseWhitespace: true,
  conservativeCollapse: true
};
var imageCache = {};

function absolutize (html) {
  if (!html) {
    return html;
  }
  var $ = cheerio.load(html);

  $('a[href]').each(resolve('href'));
  $('img[src]').each(resolve('src'));
  $('iframe[src]').each(resolve('src'));
  $('script[src]').each(resolve('src'));
  $('link[href]').each(resolve('href'));

  var absolute = $.html();
  var undeferred = undeferImages(absolute); // undo deferred image sources
  return undeferred;

  function resolve (prop) {
    return function each () {
      var elem = $(this);
      var href = elem.attr(prop);
      var absolute = url.resolve(authority, href);
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
  var $ = cheerio.load(html);
  var images = $('img[src]').map(src);
  var result = _(images).filter(notEmoji).concat(extras || []).uniq().compact().value();

  imageCache[key] = {
    value: result.slice(),
    expires: moment.utc().add(6, 'hours')
  };

  return result;

  function src () {
    return $(this).attr('src');
  }
}

function isEmoji (src) {
  return src.indexOf('https://twemoji.maxcdn.com/') === 0;
}

function notEmoji (src) {
  return !isEmoji(src);
}

function isEmojiEl ($) {
  return (i, el) => isEmoji($(el).attr('src'));
}

function fixedEmojiSize (html) {
  var $ = cheerio.load(html);
  $('img[src]').filter(isEmojiEl($)).css({
    width: '1em',
    height: '1em',
    margin: '0 0.05em 0 0.1em',
    'vertical-align': '-0.1em'
  });
  return $.html();
}

function removeEmoji (html) {
  var $ = cheerio.load(html);
  $('img[src]').filter(isEmojiEl($)).remove();
  return $.html();
}

function downgradeEmojiImages (html) {
  var $ = cheerio.load(html);
  $('img[src]').filter(isEmojiEl($)).each(replace);
  return $.html();
  function replace (i, el) {
    const $el = $(el);
    $el.replaceWith($el.attr('alt'));
  }
}

function getText (html) {
  return cheerio.load(html)('*').text();
}

function minify (html) {
  return minifyHtml(html, minifierOptions);
}

function deferImages (html, startIndex) {
  if (!html) {
    return html;
  }
  var $ = cheerio.load(html);
  $('img[src]').each(defer);
  return $.html();

  function defer (i) {
    var start = startIndex || 0;
    var elem, fallback;
    if (i < start) {
      return;
    }
    elem = $(this);
    fallback = util.format('<noscript>%s</noscript>', $.html(elem));
    elem.attr('data-src', elem.attr('src'));
    elem.addClass('js-only');
    elem.removeAttr('src');
    elem.after(fallback);
  }
}

function undeferImages (html) {
  if (!html) {
    return html;
  }
  var $ = cheerio.load(html);
  $('img[data-src]').each(undefer);
  return $.html();

  function undefer () {
    var elem = $(this);
    elem.attr('src', elem.attr('data-src'));
    elem.removeClass('js-only');
    elem.removeAttr('data-src');
    elem.next('noscript').remove();
  }
}

function externalizeLinks (html) {
  if (!html) {
    return html;
  }
  var $ = cheerio.load(html);
  $('a[href]').attr('target', '_blank');
  $('a[href]').attr('rel', 'nofollow');
  return $.html();
}

function linkThrough (html, mapper) {
  if (!html) {
    return html;
  }
  var $ = cheerio.load(html);
  $('a[href]').each(update);
  return $.html();
  function update () {
    var elem = $(this);
    var href = elem.attr('href');
    elem.attr('href', mapper(href));
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
