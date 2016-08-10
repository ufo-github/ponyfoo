'use strict';

const he = require('he');
const truncHtml = require('trunc-html');

function summarize (html, limit) {
  const options = {
    ignoredTags: ['blockquote', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
    sanitizer: {
      allowedAttributes: {
        mark: ['class']
      },
      allowedClasses: {
        img: ['tj-emoji']
      },
      filter: function (token) {
        if (token.tag !== 'img') {
          return true;
        }
        const hasEmojiClass = (token.attrs.class || '').indexOf('tj-emoji') !== -1;
        return hasEmojiClass;
      }
    },
    imageAltText: true
  };
  const result = truncHtml(html, limit || Infinity, options);
  result.text = he.decode(result.text);
  return result;
}

module.exports = {
  summarize: summarize
};
