'use strict';

var util = require('util');
var contra = require('contra');
var feedService = require('./feed');
var markupService = require('./markup');
var weeklyService = require('./weekly');
var WeeklyIssue = require('../models/WeeklyIssue');
var env = require('../lib/env');
var authority = env('AUTHORITY');

function getFeed (done) {
  WeeklyIssue
    .find({ status: 'released', statusReach: 'everyone' })
    .populate('author', 'displayName email')
    .sort('-publication')
    .limit(20)
    .exec(found);

  function found (err, issues) {
    if (err) {
      done(err); return;
    }
    contra.map(issues, toFeedItem, done);
    function toFeedItem (issue, next) {
      var fullHtml = '<div>' + issue.contentHtml + '</div>';
      var description = markupService.compile(fullHtml, {
        markdown: false,
        absolutize: true,
        fixEmojiSize: true
      });
      var item = {
        title: issue.name + ' \u2014 Pony Foo Weekly',
        url: authority + '/weekly/' + issue.slug,
        description: description,
        categories: weeklyService.getAllTags(issue),
        author: util.format('%s <%s>', issue.author.displayName, issue.author.email),
        date: issue.publication
      };
      next(null, item);
    }
  }
}

module.exports = feedService.from({
  id: 'weekly',
  href: '/weekly/feed',
  title: 'Pony Foo Weekly',
  description: 'Latest Pony Foo Weekly issues',
  getFeed: getFeed
});
