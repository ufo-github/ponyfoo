'use strict';

var contra = require('contra');
var WeeklyIssueSubmission = require('../../../models/WeeklyIssueSubmission');
var datetimeService = require('../../../services/datetime');
var markupService = require('../../../services/markup');
var weeklyCompilerService = require('../../../services/weeklyCompiler');
var subtypeMap = {
  suggestion: 'Suggestion',
  primary: 'Primary Sponsorship',
  secondary: 'Sponsored Link',
  job: 'Job Listing'
};

module.exports = getModel;

function getModel (req, res, next) {
  contra.waterfall([findSubmissions, mapToRowModels], respond);

  function findSubmissions (next) {
    WeeklyIssueSubmission.find({}).sort('-created').lean().exec(next);
  }

  function mapToRowModels (submissions, next) {
    contra.map(submissions, toRowModel, next);
  }

  function toRowModel (submission, next) {
    var options = {
      markdown: markupService,
      slug: 'submission-preview'
    };
    weeklyCompilerService.toLinkSectionModel(submission.section, options, gotModel);
    function gotModel (err, model) {
      if (err) {
        next(err); return;
      }
      next(null, {
        created: datetimeService.field(submission.created),
        slug: submission.slug,
        title: submission.section.title,
        titleHtml: model.item.titleHtml,
        accepted: submission.accepted,
        status: submission.status,
        type: subtypeMap[submission.subtype],
        submitter: submission.submitter,
        email: submission.email
      });
    }
  }

  function respond (err, submissionModels) {
    if (err) {
      next(err); return;
    }
    res.viewModel = {
      model: {
        title: 'Submission Review',
        meta: {
          canonical: '/weekly/submissions/review'
        },
        submissions: submissionModels
      }
    };
    next();
  }
}
