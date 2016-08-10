'use strict';

var _ = require('lodash');
var env = require('../lib/env');
var htmlService = require('./html');
var staticService = require('./static');
var authority = env('AUTHORITY');
var defaultCover = authority + staticService.unroll('/img/banners/branded.png');

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
  var weighted = _.map(articles, 'tags').reduce(countTags, []);
  var sorted = _.sortBy(weighted, 'count').reverse();
  return _(sorted).map('tag').first(max || 5);
}

function extractImagesFromArticles (source) {
  var many = Array.isArray(source);
  var articles = many ? source : [source];
  var reduced = articles.reduce(articleReducer, {});
  var values = _.values(reduced);
  var images = many ? _(values).map('0').flatten().uniq().compact().value() : _.flatten(values);
  return {
    images: appendDefaultCover(images),
    map: reduced
  };
  function articleReducer (reduced, article) {
    reduced[article._id] = extractImagesFromArticle(article);
    return reduced;
  }
}

function extractImagesFromArticle (article) {
  var extras = [];
  if (article.heroImage) {
    extras.push(article.heroImage);
  }
  return htmlService.extractImages(
    article.slug,
    article.teaserHtml + article.introductionHtml + article.bodyHtml,
    extras
  );
}

module.exports = {
  appendDefaultCover: appendDefaultCover,
  mostCommonTags: mostCommonTags,
  extractImages: extractImagesFromArticles
};
