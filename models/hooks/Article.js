'use strict';

var contra = require('contra');
var beautifyText = require('beautify-text');
var markupService = require('../../services/markup');
var markdownService = require('../../services/markdown');
var sitemapService = require('../../services/sitemap');
var articleFeedService = require('../../services/articleFeed');
var articleSummarizationService = require('../../services/articleSummarization');
var articleSearchService = require('../../services/articleSearch');
var articleGitService = require('../../services/articleGit');
var articleService = require('../../services/article');
var Article = require('../Article');
var env = require('../../lib/env');

Article.schema.pre('save', beforeSave);
Article.schema.post('save', afterSave);

function beforeSave (next) {
  var rstrip = /^\s*<p>\s*|\s*<\/p>\s*$/ig;
  var bulk = env('BULK_INSERT');
  var article = this;
  var oldSign = article.sign;

  article.sign = articleService.computeSignature(article);
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
    next => articleGitService.pushToGit({ article, oldSlug: article._oldSlug }, next)
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
