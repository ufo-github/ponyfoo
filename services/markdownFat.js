'use strict';

var cheerio = require('cheerio');
var htmlService = require('./html');
var markdownService = require('./markdown');

function compile (text) {
  var html = markdownService.compile(text);
  var minified = htmlService.minify(html);
  return minified;
}

function compileExternalizeLinks (text) {
  var html = compile(text);
  var $ = cheerio.load(html);
  $('a[href]').attr('target', '_blank');
  $('a[href]').attr('rel', 'nofollow');
  return $.html();
}

module.exports = {
  compile: compile,
  compileExternalizeLinks: compileExternalizeLinks
};
