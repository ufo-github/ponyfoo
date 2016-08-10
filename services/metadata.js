'use strict';

const _ = require('lodash');
const env = require('../lib/env');
const htmlService = require('./html');
const staticService = require('./static');
const authority = env('AUTHORITY');
const defaultCover = authority + staticService.unroll('/img/banners/branded.png');

function appendDefaultCover (list) {
  list.push(defaultCover);
  return list;
}

function countTags (accumulator, tag) {
  const existing = _.find(accumulator, { tag: tag });
  if (existing) {
    existing.count++;
  } else {
    accumulator.push({ tag: tag, count: 1 });
  }
  return accumulator;
}

function mostCommonTags (articles, max) {
  const weighted = _.map(articles, 'tags').reduce(countTags, []);
  const sorted = _.sortBy(weighted, 'count').reverse();
  return _(sorted).map('tag').first(max || 5);
}

function extractImagesFromArticles (source) {
  const many = Array.isArray(source);
  const articles = many ? source : [source];
  const reduced = articles.reduce(articleReducer, {});
  const values = _.values(reduced);
  const images = many ? _(values).map('0').flatten().uniq().compact().value() : _.flatten(values);
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
  const extras = [];
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
