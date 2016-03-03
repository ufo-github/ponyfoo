'use strict';

var env = require('../../lib/env');
var staticService = require('../../services/static');
var WeeklyIssue = require('../../models/WeeklyIssue');
var weeklyService = require('../../services/weekly');
var authority = env('AUTHORITY');

module.exports = function (req, res, next) {
  var query = { status: 'released', statusReach: 'everyone' };

  WeeklyIssue.find(query).sort('-publication').exec(found);

  function found (err, issues) {
    if (err) {
      next(err); return;
    }
    var models = issues.map(weeklyService.toHistory);
    res.viewModel = {
      model: {
        meta: {
          canonical: '/weekly/history',
          description: 'Every Pony Foo Weekly newsletter issue ever published on Pony Foo can be found listed here!',
          keywords: weeklyService.getAllTags(issues),
          images: [authority + staticService.unroll('/img/ponyfooweekly-sample.png')]
        },
        title: 'Pony Foo Weekly Publication History',
        issues: models
      }
    };
    next();
  }
};
