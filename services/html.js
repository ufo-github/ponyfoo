'use strict';

var _ = require('lodash');
var url = require('url');
var moment = require('moment');
var cheerio = require('cheerio');
var env = require('../lib/env');
var authority = env('AUTHORITY');
var imageCache = {};

function absolutize (html, done) {
  var $ = cheerio.load(html);

  $('a[href]').each(resolve('href'));
  $('img[src]').each(resolve('src'));
  $('iframe[src]').each(resolve('src'));
  $('script[src]').each(resolve('src'));
  $('link[href]').each(resolve('href'));

  done(null, $.html());

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
  return item && moment().isBefore(item.expires);
}

function extractImages (key, html) {
  if (fresh(imageCache[key])) {
    return imageCache[key].value;
  }
  var $ = cheerio.load(html);
  var images = $('img[src]').map(src);
  var result = _(images).uniq().compact().value();

  imageCache[key] = {
    value: result,
    expires: moment().add(6, 'hours')
  };

  function src () {
    return $(this).attr('src');
  }
  return result;
}

function getText (html) {
  return cheerio.load(html).text();
}

module.exports = {
  absolutize: absolutize,
  extractImages: extractImages,
  getText: getText
};
