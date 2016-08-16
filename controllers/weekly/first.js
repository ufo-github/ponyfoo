'use strict';

const WeeklyIssue = require(`../../models/WeeklyIssue`);
const redirect = require(`./lib/redirect`);

module.exports = function (req, res, next) {
  WeeklyIssue
    .find({ status: `released`, statusReach: `everyone` })
    .sort(`publication`)
    .limit(1)
    .exec(redirect(res, next));
};
