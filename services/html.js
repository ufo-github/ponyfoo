'use strict';

var url = require('url');
var cheerio = require('cheerio');
var env = require('../lib/env');
var authority = env('AUTHORITY');

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

module.exports = {
  absolutize: absolutize
};
