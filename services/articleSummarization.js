'use strict'

var truncHtml = require('trunc-html');
var markdownService = require('./markdown');

function summarize (article) {
  var options = {
    ignoredTags: ['blockquote', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'img'],
    sanitizer: {
      allowedAttributes: {
        mark: ['class']
      }
    }
  };
  if (article.summary) { // author-provided summary
    return truncHtml(markdownService.compile(article.summary), Infinity, options);
  }
  var all = article.teaserHtml + article.introductionHtml;
  var limit = 170;
  return truncHtml(all, limit, options);
}

module.exports = {
  summarize: summarize
};
