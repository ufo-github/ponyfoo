'use strict';

var _ = require('lodash');
var contra = require('contra');
var WeeklyIssue = require('../../../models/WeeklyIssue');
var weeklyService = require('../../../services/weekly');
var settingService = require('../../../services/setting');

module.exports = getModel;

function getModel (req, res, next) {
  contra.concurrent({
    live: function (next) {
      settingService.getKey('PONYFOOWEEKLY_CRON', next);
    },
    level: function (next) {
      settingService.getKey('PONYFOOWEEKLY_CRON_LEVEL', next);
    },
    weeklies: function (next) {
      WeeklyIssue.find({}).sort([['publication', -1], ['updated', -1]]).exec(next);
    }
  }, respond);

  function respond (err, result) {
    if (err) {
      next(err); return;
    }
    var models = result.weeklies.map(weeklyService.toMetadata);
    var sorted = _.sortBy(models, sortByStatus);
    res.viewModel = {
      model: {
        title: 'Newsletter Review',
        meta: {
          canonical: '/author/weeklies'
        },
        weeklies: sorted,
        live: result.live,
        level: result.level
      }
    };
    next();
  }
}

function sortByStatus (weekly) {
  var state = { draft: 0, ready: 1, released: 2 }[weekly.status];
  var reach = { undefined: 0, scheduled: 1, patrons: 2, everyone: 3 }[weekly.statusReach];
  return state + reach;
}
