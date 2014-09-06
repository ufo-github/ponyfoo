'use strict';

var cheerio = require('cheerio');
var markdownService = require('./markdown');

function compileExternalizeLinks (text) {
  var html = markdownService.compile(text);
  var $ = cheerio.load(html);
  $('a[href]').attr('target', '_blank');
  $('a[href]').attr('rel', 'nofollow');
  return $.html();
}

module.exports = {
  compile: markdownService.compile,
  compileExternalizeLinks: compileExternalizeLinks
};
