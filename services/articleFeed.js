'use strict';

var util = require('util');
var contra = require('contra');
var feedService = require('./feed');
var markupService = require('./markup');
var Article = require('../models/Article');
var env = require('../lib/env');
var authority = env('AUTHORITY');

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
      var fullHtml = (
        '<div>' +
          article.teaserHtml +
          article.introductionHtml +
          article.bodyHtml +
        '</div>'
      );
      var description = markupService.compile(fullHtml, {
        markdown: false,
        absolutize: true,
        fixEmojiSize: true
      });
      var item = {
        title: article.title,
        description: description,
        url: authority + '/articles/' + article.slug,
        categories: article.tags,
        author: util.format('%s <%s>', article.author.displayName, article.author.email),
        date: article.publication
      };
      next(null, item);
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
