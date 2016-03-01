'use strict'

var truncHtml = require('trunc-html');

function summarize (html, limit) {
  var options = {
    ignoredTags: ['blockquote', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'img'],
    sanitizer: {
      allowedAttributes: {
        mark: ['class']
      }
    }
  };
  return truncHtml(html, limit || Infinity, options);
}

module.exports = {
  summarize: summarize
};
