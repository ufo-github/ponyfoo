'use strict';

const env = require(`../../lib/env`);
const staticService = require(`../../services/static`);
const WeeklyIssue = require(`../../models/WeeklyIssue`);
const weeklyService = require(`../../services/weekly`);
const authority = env(`AUTHORITY`);

module.exports = function (req, res, next) {
  const query = { status: `released`, statusReach: `everyone` };

  WeeklyIssue.find(query).sort(`-publication`).exec(found);

  function found (err, issues) {
    if (err) {
      next(err); return;
    }
    const models = issues.map(weeklyService.toHistory);
    res.viewModel = {
      model: {
        meta: {
          canonical: `/weekly/history`,
          description: `Every Pony Foo Weekly newsletter issue ever published on Pony Foo can be found listed here!`,
          keywords: weeklyService.getAllTags(issues),
          images: [authority + staticService.unroll(`/img/ponyfooweekly-sample.png`)]
        },
        title: `Pony Foo Weekly Publication History`,
        issues: models,
        any: issues.length > 0
      }
    };
    next();
  }
};
