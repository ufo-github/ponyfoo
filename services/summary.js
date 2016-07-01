'use strict'

var he = require('he');
var truncHtml = require('trunc-html');

function summarize (html, limit) {
  var options = {
    ignoredTags: ['blockquote', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'img'],
    sanitizer: {
      allowedAttributes: {
        mark: ['class']
      },
      allowedClasses: {
        img: ['tj-emoji']
      }
    }
  };
  var result = truncHtml(html, limit || Infinity, options);
  result.text = he.decode(result.text);
  return result;
}

module.exports = {
  summarize: summarize
};
