'use strict';

var but = require('but');
var contra = require('contra');
var WeeklyIssueSubmission = require('../../../../models/WeeklyIssueSubmission');
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
    var status = actions[req.params.action];
    submission.status = status;
    submission.save(but(next));
  }

  function handle (err) {
    if (err) {
      next(err); return;
    }
    res.redirect('/weekly/submissions/review');
  }
}

module.exports = remove;
