'use strict';

var _ = require('lodash');
var env = require('../lib/env');
var htmlService = require('./html');
var authority = env('AUTHORITY');
var defaultCover = authority + '/img/thumbnail.png';

function appendDefaultCover (list) {
  list.push(defaultCover);
  return list;
}

function countTags (accumulator, tag) {
  var existing = _.find(accumulator, { tag: tag });
  if (existing) {
    existing.count++;
  } else {
    accumulator.push({ tag: tag, count: 1 });
  }
  return accumulator;
}

function mostCommonTags (articles, max) {
  var weighted = _.pluck(articles, 'tags').reduce(countTags, []);
  var sorted = _.sortBy(weighted, 'count').reverse();
  return _(sorted).pluck('tag').first(max || 5);
}

function extractImagesFromArticle (article) {
  return htmlService.extractImages(article.slug, article.teaserHtml + article.bodyHtml);
}

function extractImages (source) {
  var many = Array.isArray(source);
  var articles = many ? source : [source];
  var images = articles.map(extractImagesFromArticle);
  var result = many ? _(images).pluck('0').flatten().uniq().compact().value() : _.flatten(images);
  return appendDefaultCover(result);
}

module.exports = {
  appendDefaultCover: appendDefaultCover,
  mostCommonTags: mostCommonTags,
  extractImages: extractImages
};
