'use strict';

const debounce = require(`lodash/debounce`);
const contra = require(`contra`);
const feedService = require(`./feed`);
const weeklyFeedService = require(`./weeklyFeed`);
const articleFeedService = require(`./articleFeed`);
const fullFeed = feedService.from({
  id: `all`,
  href: `/all/feed`,
  title: `Pony Foo`,
  description: `Latest feed items published on Pony Foo`,
  getFeed: getFeed
});
const rebuildSlowly = debounce(fullFeed.rebuild, 4000);

weeklyFeedService.on(`built`, rebuildSlowly);
articleFeedService.on(`built`, rebuildSlowly);

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
