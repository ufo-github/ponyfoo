'use strict';

var markdownFatService = require('../../services/markdownFat');
var cryptoService = require('../../services/crypto');
var articleSearchService = require('../../services/articleSearch');
var feedService = require('../../services/feed');
var sitemapService = require('../../services/sitemap');
var Article = require('../Article');
var env = require('../../lib/env');

Article.schema.pre('save', beforeSave);
Article.schema.post('save', afterSave);

function computeSignature (a) {
  return cryptoService.md5([a.title, a.status, a.introduction, a.body].concat(a.tags).join(' '));
}

function beforeSave (next) {
  var bulk = env('BULK_INSERT');
  var article = this;
  var oldSign = article.sign;

  article.sign = computeSignature(article);
  article.introductionHtml = markdownFatService.compile(article.introduction);
  article.bodyHtml = markdownFatService.compile(article.body);
  article.updated = Date.now();

  if (!bulk && oldSign !== article.sign && article.status === 'published') {
    articleSearchService.addRelated(article, next);
  } else {
    next();
  }
}

function afterSave () {
  var bulk = env('BULK_INSERT');
  if (bulk) { // trust that these will be rebuilt afterwards
    return;
  }
  articleSearchService.insert(this, this._id);
  feedService.rebuild();
  sitemapService.rebuild();
}

module.exports = Article;
