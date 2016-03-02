'use strict';

var WeeklyIssue = require('../../models/WeeklyIssue');
var weeklyService = require('../../services/weekly');
var metadataService = require('../../services/metadata');

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
          images: metadataService.appendDefaultCover([])
        },
        title: 'Pony Foo Weekly Publication History',
        issues: models
      }
    };
    next();
  }
};
