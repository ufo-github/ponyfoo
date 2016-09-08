'use strict';

const contra = require(`contra`);
const WeeklyIssueSubmission = require(`../../../../models/WeeklyIssueSubmission`);
const weeklySubmissionService = require(`../../../../services/weeklySubmission`);
const actions = {
  reject: `rejected`,
  accept: `accepted`,
  use: `used`
};

function remove (req, res, next) {
  contra.waterfall([lookupSubmission, found], handle);

  function lookupSubmission (next) {
    const query = { slug: req.params.slug };
    WeeklyIssueSubmission.findOne(query).exec(next);
  }

  function found (submission, next) {
    if (!submission) {
      req.flash(`error`, [`Weekly submission not found.`]);
      res.redirect(`/weekly/submissions/review`);
      return;
    }
    const action = req.params.action;
    const status = actions[action];
    const accepting = status === `accepted` && !weeklySubmissionService.wasEverAccepted(submission);
    if (accepting) {
      submission.accepted = true;
    }
    submission.status = status;
    submission.save(saved);
    function saved (err) {
      if (err) {
        next(err); return;
      }
      if (accepting) {
        weeklySubmissionService.notifyAccepted(submission);
      }
      next(null);
    }
  }

  function handle (err) {
    if (err) {
      next(err); return;
    }
    res.redirect(`/weekly/submissions/review`);
  }
}

module.exports = remove;
