'use strict';

var env = require('../../lib/env');
var staticService = require('../../services/static');
var WeeklyIssue = require('../../models/WeeklyIssue');
var weeklyService = require('../../services/weekly');
var cryptoService = require('../../services/crypto');
var htmlService = require('../../services/html');
var metadataService = require('../../services/metadata');
var authority = env('AUTHORITY');

module.exports = function (req, res, next) {
  var thanks = req.query.thanks;
  var query = { slug: req.params.slug };
  WeeklyIssue.findOne(query).populate('comments').exec(found);

  function found (err, issue) {
    if (err || !issue) {
      notFound(); return;
    }
    if (issue.status === 'released') {
      if (issue.statusReach === 'everyone') {
        done(); return;
      }
      var challenge = cryptoService.md5(issue._id + issue.thanks);
      if (issue.statusReach === 'patrons' && thanks && thanks === challenge) {
        handle(null, issue, challenge); return;
      }
    }
    var verify = req.query.verify;
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
    var canonical = '/weekly/' + issue.slug;
    var permalink = canonical + (challenge ? ('?thanks=' + challenge) : '');
    var extracted = htmlService.extractImages('/weekly/' + issue.slug, issue.summaryText + issue.contentHtml);
    var images = extracted.concat(authority + staticService.unroll('/img/ponyfooweekly-sample.png'));

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
