'use strict';

var WeeklyIssue = require('../../models/WeeklyIssue');
var randomService = require('../../services/random');
var redirect = require('./lib/redirect');

module.exports = function (req, res, next) {
  randomService.find(WeeklyIssue, { status: 'released', statusReach: 'everyone' }, 1, redirect(res, next));
};
