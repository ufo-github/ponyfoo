'use strict';

var sampleIssue = require('./lib/sampleIssue.json');
var weeklyService = require('../../../services/weekly');

module.exports = function (req, res, next) {
  weeklyService.compile(sampleIssue, compiled);
  function compiled (err, sampleIssue) {
    if (err) {
      next(err); return;
    }
    res.ignoreNotFound = true;
    res.viewModel = {
      leanLayout: true,
      model: {
        title: 'Media Kit \u2014 Pony Foo',
        action: '../server/pdf/mediakit',
        issue: sampleIssue
      }
    };
    next();
  }
};

