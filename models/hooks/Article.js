'use strict';

var markdownService = require('../../services/markdown');
var cryptoService = require('../../services/crypto');
var articleSearch = require('../../services/articleSearch');
var feedService = require('../../services/feed');
var sitemapService = require('../../services/sitemap');
var Article = require('../Article');

Article.schema.virtual('permalink').get(computePermalink);
Article.schema.pre('save', beforeSave);
Article.schema.post('save', afterSave);

function computePermalink () {
  return '/articles/' + this.slug;
}

function computeSignature (a) {
  return cryptoService.md5([a.title, a.status, a.introduction, a.body].concat(a.tags).join(' '));
}

function beforeSave (next) {
  var article = this;
  var oldSign = article.sign;

  article.sign = computeSignature(article);
  article.introductionHtml = markdownService.compile(article.introduction);
  article.bodyHtml = markdownService.compile(article.body);
  article.updated = Date.now();

  if (oldSign !== article.sign && article.status === 'published') {
    articleSearch.addRelated(article, next);
  } else {
    next();
  }
}

function afterSave () {
  articleSearch.insert(this, this._id);
  feedService.rebuild();
  sitemapService.rebuild();
}

module.exports = Article;
