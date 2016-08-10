'use strict';

var debounce = require('lodash/debounce');
var contra = require('contra');
var feedService = require('./feed');
var weeklyFeedService = require('./weeklyFeed');
var articleFeedService = require('./articleFeed');
var fullFeed = feedService.from({
  id: 'all',
  href: '/all/feed',
  title: 'Pony Foo',
  description: 'Latest feed items published on Pony Foo',
  getFeed: getFeed
});
var rebuildSlowly = debounce(fullFeed.rebuild, 4000);

weeklyFeedService.on('built', rebuildSlowly);
articleFeedService.on('built', rebuildSlowly);

function getFeed (done) {
  contra.concurrent({
    weekly: contra.curry(weeklyFeedService.getFeed),
    articles: contra.curry(articleFeedService.getFeed)
  }, merge);
  function merge (err, result) {
    if (err) {
      done(err); return;
    }
    done(null, result.weekly.concat(result.articles));
  }
}

module.exports = fullFeed;
