'use strict';

var env = require('../../lib/env');
var staticService = require('../../services/static');
var authority = env('AUTHORITY');
var WeeklyIssue = require('../../models/WeeklyIssue');

module.exports = function (req, res, next) {
  var query = { status: 'released', statusReach: 'everyone' };
  WeeklyIssue.count(query, counted);
  function counted (err, count) {
    if (err) {
      next(err); return;
    }
    res.viewModel = {
      model: {
        title: 'Pony Foo Weekly',
        meta: {
          images: [authority + staticService.unroll('/img/ponyfooweekly-sample.png')],
          description: 'Pony Foo Weekly is a newsletter discussing interesting and trending topics around the web platform. It comes out once a week, on thursdays.'
        },
        any: any
      }
    };
    next();
  }
}
