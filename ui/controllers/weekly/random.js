'use strict';

const WeeklyIssue = require(`../../models/WeeklyIssue`);
const randomService = require(`../../services/random`);
const redirect = require(`./lib/redirect`);

module.exports = function (req, res, next) {
  randomService.find(WeeklyIssue, { status: `released`, statusReach: `everyone` }, 1, redirect(res, next));
};
