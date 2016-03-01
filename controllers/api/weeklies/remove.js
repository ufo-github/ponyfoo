'use strict';

var contra = require('contra');
var WeeklyIssue = require('../../../models/WeeklyIssue');

function remove (req, res, next) {
  contra.waterfall([lookupWeekly, found], handle);

  function lookupWeekly (next) {
    var query = { slug: req.params.slug };
    WeeklyIssue.findOne(query).exec(next);
  }

  function found (weekly, next) {
    if (!weekly) {
      res.status(404).json({ messages: ['Weekly issue not found'] }); return;
    }
    weekly.remove(next);
  }

  function handle (err) {
    if (err) {
      next(err); return;
    }
    res.json({});
  }
}

module.exports = remove;
