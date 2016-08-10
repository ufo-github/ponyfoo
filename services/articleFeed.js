'use strict';

const fs = require('fs');
const util = require('util');
const contra = require('contra');
const cheerio = require('cheerio');
const inlineCss = require('inline-css');
const feedService = require('./feed');
const markupService = require('./markup');
const Article = require('../models/Article');
const env = require('../lib/env');
const authority = env('AUTHORITY');
const css = fs.readFileSync('.bin/static/article.css', 'utf8');

function getFeed (done) {
  Article
    .find({ status: 'published' })
    .populate('author', 'displayName email')
    .sort('-publication')
    .limit(20)
    .exec(found);

  function found (err, articles) {
    if (err) {
      done(err); return;
    }
    contra.map(articles, toFeedItem, done);
    function toFeedItem (article, next) {
      formatContent((
        article.teaserHtml +
       (article.editorNoteHtml || '') +
        article.introductionHtml +
        article.bodyHtml
      ), formatted);
      function formatted (err, description) {
        if (err) {
          next(err); return;
        }
        next(null, {
          title: article.title,
          description: description,
          url: authority + '/articles/' + article.slug,
          categories: article.tags,
          author: util.format('%s <%s>', article.author.displayName, article.author.email),
          date: article.publication
        });
      }
    }
    function formatContent (contentHtml, done) {
      const compilerOpts = {
        markdown: false,
        absolutize: true,
        removeEmoji: true
      };
      const inliningOpts = {
        extraCss: css,
        url: authority
      };
      const contents = '<div class="f-core md-markdown">' + contentHtml + '</div>';
      const fixed = markupService.compile(contents, compilerOpts);

      inlineCss(fixed, inliningOpts).then(inlinedCss, done);

      function inlinedCss (inlined) {
        const $ = cheerio.load(inlined);
        const html = $.html();
        done(null, html);
      }
    }
  }
}

module.exports = feedService.from({
  id: 'articles',
  href: '/articles/feed',
  title: 'Pony Foo',
  description: 'Latest articles published on Pony Foo',
  getFeed: getFeed
});
