'use strict';

var WeeklyIssueSubmission = require('../../../models/WeeklyIssueSubmission');
var datetimeService = require('../../../services/datetime');
var subtypeMap = {
  suggestion: 'Suggestion',
  primary: 'Primary Sponsorship',
  secondary: 'Sponsored Link',
  job: 'Job Listing'
};

module.exports = getModel;

function getModel (req, res, next) {
  WeeklyIssueSubmission.find({}).sort('-created').lean().exec(respond);

  function respond (err, submissions) {
    if (err) {
      next(err); return;
    }
    res.viewModel = {
      model: {
        title: 'Submission Review',
        meta: {
          canonical: '/weekly/submissions/review'
        },
        submissions: submissions.map(toSubmissionRowModel)
      }
    };
    next();
  }
}

function toSubmissionRowModel (submission) {
  return {
    created: datetimeService.field(submission.created),
    slug: submission.slug,
    title: submission.section.title,
    status: submission.status,
    type: subtypeMap[submission.subtype],
    submitter: submission.submitter,
    email: submission.email
  };
}
