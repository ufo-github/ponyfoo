'use strict';

var beautifyText = require('beautify-text');
var markupService = require('../../services/markup');
var markdownService = require('../../services/markdown');
var cryptoService = require('../../services/crypto');
var feedService = require('../../services/feed');
var sitemapService = require('../../services/sitemap');
var articleService = require('../../services/article');
var articleSearchService = require('../../services/articleSearch');
var Article = require('../Article');
var env = require('../../lib/env');
var rstrip = /^\s*<p>\s*|\s*<\/p>\s*/ig;

Article.schema.pre('save', beforeSave);
Article.schema.post('save', afterSave);

function computeSignature (a) {
  var bits = [
    a.titleMarkdown,
    a.status,
    a.summary || '',
    a.teaser,
    a.introduction,
    a.body
  ];
  return cryptoService.md5(bits.concat(a.tags).join(' '));
}

function beforeSave (next) {
  var bulk = env('BULK_INSERT');
  var article = this;
  var oldSign = article.sign;

  article.sign = computeSignature(article);
  article.titleHtml = toHtml(article.titleMarkdown).replace(rstrip, '');
  article.title = beautifyText(markdownService.decompile(article.titleHtml, { plain: true }));
  article.teaserHtml = toHtml(article.teaser, 1);
  article.introductionHtml = toHtml(article.introduction, 1);
  article.bodyHtml = toHtml(article.body, true);
  var summary = articleService.summarize(article);
  article.summaryText = summary.text;
  article.summaryHtml = summary.html;
  article.updated = Date.now();

  if (!bulk && oldSign !== article.sign && article.status === 'published') {
    articleSearchService.addRelated(article, next);
  } else {
    next();
  }
}

function toHtml (md, i) {
  return markupService.compile(md, { deferImages: i });
}

function afterSave () {
  var bulk = env('BULK_INSERT');
  if (bulk) { // trust that these will be rebuilt afterwards
    return;
  }
  feedService.rebuild();
  sitemapService.rebuild();
}

module.exports = Article;
