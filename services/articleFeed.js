'use strict';

var fs = require('fs');
var util = require('util');
var contra = require('contra');
var cheerio = require('cheerio');
var inlineCss = require('inline-css');
var feedService = require('./feed');
var markupService = require('./markup');
var Article = require('../models/Article');
var env = require('../lib/env');
var authority = env('AUTHORITY');
var css = fs.readFileSync('.bin/static/article.css', 'utf8');

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
      var compilerOpts = {
        markdown: false,
        absolutize: true,
        removeEmoji: true
      };
      var inliningOpts = {
        extraCss: css,
        url: authority
      };
      var contents = '<div class="f-core md-markdown">' + contentHtml + '</div>';
      var fixed = markupService.compile(contents, compilerOpts);

      inlineCss(fixed, inliningOpts).then(inlinedCss, done);

      function inlinedCss (inlined) {
        var $ = cheerio.load(inlined);
        var html = $.html();
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
