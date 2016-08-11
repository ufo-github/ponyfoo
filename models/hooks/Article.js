'use strict';

const contra = require('contra');
const winston = require('winston');
const beautifyText = require('beautify-text');
const markupService = require('../../services/markup');
const markdownService = require('../../services/markdown');
const sitemapService = require('../../services/sitemap');
const articleFeedService = require('../../services/articleFeed');
const articleSummarizationService = require('../../services/articleSummarization');
const articleSearchService = require('../../services/articleSearch');
const articleGitService = require('../../services/articleGit');
const articleService = require('../../services/article');
const Article = require('../Article');
const env = require('../../lib/env');

Article.schema.pre('save', beforeSave);
Article.schema.post('save', afterSave);

function beforeSave (next) {
  const rstrip = /^\s*<p>\s*|\s*<\/p>\s*$/ig;
  const rstripemptyparagraph = /^\s*<p>\s*<\/p>\s*$/i;
  const bulk = env('BULK_INSERT');
  const article = this;
  const oldSign = article.sign;

  article.sign = articleService.computeSignature(article);
  article.titleHtml = toHtml(article.titleMarkdown).replace(rstrip, '');
  article.title = beautifyText(markdownService.decompile(article.titleHtml, { plain: true }));
  article.teaserHtml = toHtml(article.teaser, 1);
  article.editorNoteHtml = toHtml(article.editorNote || '', 1).replace(rstripemptyparagraph, '');
  article.introductionHtml = toHtml(article.introduction, 1);
  article.bodyHtml = toHtml(article.body, true);
  const summary = articleSummarizationService.summarize(article);
  article.summaryText = summary.text;
  article.summaryHtml = summary.html;
  article.updated = Date.now();

  if (bulk || article.status !== 'published' || oldSign === article.sign) {
    next(null); return;
  }
  contra.concurrent([
    next => articleSearchService.update(article, next),
    next => articleGitService.pushToGit({ article, oldSlug: article._oldSlug }, next)
  ], err => {
    if (err) {
      winston.warn('Error while saving article', err.stack || err);
    }
    next(err);
  });
}

function toHtml (md, i) {
  return markupService.compile(md, { deferImages: i }).trim();
}

function afterSave () {
  const bulk = env('BULK_INSERT');
  if (bulk) { // trust that these will be rebuilt afterwards
    return;
  }
  articleFeedService.rebuild();
  sitemapService.rebuild();
}

module.exports = Article;
