'use strict';

const env = require('../../lib/env');
const staticService = require('../../services/static');
const WeeklyIssue = require('../../models/WeeklyIssue');
const weeklyService = require('../../services/weekly');
const cryptoService = require('../../services/crypto');
const htmlService = require('../../services/html');
const authority = env('AUTHORITY');

module.exports = function (req, res, next) {
  const thanks = req.query.thanks;
  const query = { slug: req.params.slug };
  WeeklyIssue.findOne(query).populate('comments').exec(found);

  function found (err, issue) {
    if (err || !issue) {
      notFound(); return;
    }
    if (issue.status === 'released') {
      if (issue.statusReach === 'everyone') {
        done(); return;
      }
      const challenge = cryptoService.md5(issue._id + issue.thanks);
      if (issue.statusReach === 'patrons' && thanks && thanks === challenge) {
        handle(null, issue, challenge); return;
      }
    }
    const verify = req.query.verify;
    if (verify && verify === cryptoService.md5(issue._id + issue.created)) {
      done(); return;
    }
    notFound();
    function done () {
      handle(null, issue);
    }
    function notFound () {
      handle(err, null);
    }
  }

  function handle (err, issue, challenge) {
    if (err) {
      next(err); return;
    }
    if (!issue) {
      res.viewModel = {
        skip: true
      };
      next(); return;
    }
    const canonical = '/weekly/' + issue.slug;
    const permalink = canonical + (challenge ? ('?thanks=' + challenge) : '');
    const extracted = htmlService.extractImages('/weekly/' + issue.slug, issue.summaryText + issue.contentHtml);
    const images = extracted.concat(authority + staticService.unroll('/img/ponyfooweekly-sample.png'));

    res.viewModel = {
      model: {
        title: issue.computedPageTitle,
        meta: {
          canonical: canonical,
          description: issue.summaryText,
          keywords: weeklyService.getAllTags(issue),
          images: images
        },
        permalink: permalink,
        thanks: challenge,
        issue: weeklyService.toView(issue)
      }
    };
    next();
  }
};
