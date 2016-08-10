'use strict';

const contra = require('contra');
const pullSubscribers = require('../lib/pullSubscribers');
const pullPageViews = require('../lib/pullPageViews');

module.exports = function (done) {
  contra.concurrent({
    subscribers: contra.curry(pullSubscribers),
    pageviews: contra.curry(pullPageViews)
  }, render);
  function render (err, result) {
    if (err) {
      done(err); return;
    }
    done(null, {
      subscribers: result.subscribers.list,
      verified: result.subscribers.verified,
      pageviews: result.pageviews
    });
  }
};
