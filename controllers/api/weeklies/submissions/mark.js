'use strict';

var but = require('but');
var contra = require('contra');
var WeeklyIssueSubmission = require('../../../../models/WeeklyIssueSubmission');
var weeklySubmissionService = require('../../../../services/weeklySubmission');
var actions = {
  accept: 'accepted',
  use: 'used'
};

function remove (req, res, next) {
  contra.waterfall([lookupSubmission, found], handle);

  function lookupSubmission (next) {
    var query = { slug: req.params.slug };
    WeeklyIssueSubmission.findOne(query).exec(next);
  }

  function found (submission, next) {
    if (!submission) {
      req.flash('error', ['Weekly submission not found.']);
      res.redirect('/weekly/submissions/review');
      return;
    }
    var action = req.params.action;
    var status = actions[action];
    var accepting = status === 'accepted' && !submission.accepted;
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
    res.redirect('/weekly/submissions/review');
  }
}

module.exports = remove;
