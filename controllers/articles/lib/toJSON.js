'use strict';

var estimate = require('estimate');

function toJSON (article) {
  var text = [article.introductionHtml, article.bodyHtml].join(' ');
  var json = article.toJSON();

  json.readingTime = estimate.text(text);

  return json;
}

module.exports = toJSON;
