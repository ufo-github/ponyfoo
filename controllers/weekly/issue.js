'use strict';

var WeeklyIssue = require('../../models/WeeklyIssue');
var weeklyService = require('../../services/weekly');
var cryptoService = require('../../services/crypto');
var htmlService = require('../../services/html');
var metadataService = require('../../services/metadata');

module.exports = function (req, res, next) {
  var query = { slug: req.params.slug };
  WeeklyIssue.findOne(query, found);

  function found (err, issue) {
    if (err || !issue) {
      notFound(); return;
    }
    var bird = req.query.bird;
    if (issue.status === 'released') {
      if (issue.statusReach === 'everyone') {
        done(); return;
      }
      if (issue.statusReach === 'early birds' && bird && bird === cryptoService.md5(issue._id + issue.bird)) {
        done(); return;
      }
    }
    var verify = req.query.verify;
    if (verify && verify === cryptoService.md5(issue._id + issue.created)) {
      done(); return;
    }
    notFound();
    function done () {
      handle(err, issue);
    }
    function notFound () {
      handle(err, null);
    }
  }

  function handle (err, issue) {
    if (err) {
      next(err); return;
    }
    if (!issue) {
      res.viewModel = {
        skip: true
      };
      next(); return;
    }
    var extracted = htmlService.extractImages('/weekly/' + issue.slug, issue.summaryText + issue.contentHtml);
    var images = metadataService.appendDefaultCover(extracted);
    res.viewModel = {
      model: {
        title: issue.title,
        meta: {
          canonical: '/weekly/' + issue.slug,
          description: issue.summaryText,
          keywords: weeklyService.getAllTags(issue),
          images: images
        },
        issue: weeklyService.toView(issue)
      }
    };
    next();
  }
};
