'use strict';

var _ = require('lodash');
var WeeklyIssue = require('../../../models/WeeklyIssue');
var weeklyService = require('../../../services/weekly');

module.exports = getModel;

function getModel (req, res, next) {
  WeeklyIssue.find({}).sort('-publication').exec(respond);

  function respond (err, weeklies) {
    if (err) {
      next(err); return;
    }
    var models = weeklies.map(weeklyService.toMetadata);
    var sorted = _.sortBy(models, sortByStatus);
    res.viewModel = {
      model: {
        title: 'Newsletter Review',
        meta: {
          canonical: '/author/weeklies'
        },
        weeklies: sorted
      }
    };
    next();
  }
}

function sortByStatus (weekly) {
  var state = { draft: 0, ready: 1, released: 2 }[weekly.status];
  var reach = { undefined: 0, 'early birds': 1, everyone: 2 }[weekly.statusReach];
  return state + reach;
}
