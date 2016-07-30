'use strict';

var contra = require('contra');
var beautifyText = require('beautify-text');
var markupService = require('../../services/markup');
var markdownService = require('../../services/markdown');
var cryptoService = require('../../services/crypto');
var articleFeedService = require('../../services/articleFeed');
var sitemapService = require('../../services/sitemap');
var articleSummarizationService = require('../../services/articleSummarization');
var articleSearchService = require('../../services/articleSearch');
var articleGitService = require('../../services/articleGit');
var Article = require('../Article');
var env = require('../../lib/env');

Article.schema.pre('save', beforeSave);
Article.schema.post('save', afterSave);

function computeSignature (a) {
  var bits = [
    a.titleMarkdown,
    a.slug,
    a.status,
    a.summary || '',
    a.teaser,
    a.editorNote || '',
    a.introduction,
    a.body,
    a.tags.join(' ')
  ];
  return cryptoService.md5(bits.concat(a.tags).join(' '));
}

function beforeSave (next) {
  var rstrip = /^\s*<p>\s*|\s*<\/p>\s*$/ig;
  var bulk = env('BULK_INSERT');
  var article = this;
  var oldSign = article.sign;

  article.sign = computeSignature(article);
  article.titleHtml = toHtml(article.titleMarkdown).replace(rstrip, '');
  article.title = beautifyText(markdownService.decompile(article.titleHtml, { plain: true }));
  article.teaserHtml = toHtml(article.teaser, 1);
  article.editorNoteHtml = toHtml(article.editorNote || '', 1).replace(rstrip, '');
  article.introductionHtml = toHtml(article.introduction, 1);
  article.bodyHtml = toHtml(article.body, true);
  var summary = articleSummarizationService.summarize(article);
  article.summaryText = summary.text;
  article.summaryHtml = summary.html;
  article.updated = Date.now();

  if (bulk || article.status !== 'published' || oldSign === article.sign) {
    next(); return;
  }
  contra.concurrent([
    next => articleSearchService.update(article, next),
    next => articleGitService.update({ article, oldSlug: article._oldSlug }, next)
  ], next);
}

function toHtml (md, i) {
  return markupService.compile(md, { deferImages: i }).trim();
}

function afterSave () {
  var bulk = env('BULK_INSERT');
  if (bulk) { // trust that these will be rebuilt afterwards
    return;
  }
  articleFeedService.rebuild();
  sitemapService.rebuild();
}

module.exports = Article;
