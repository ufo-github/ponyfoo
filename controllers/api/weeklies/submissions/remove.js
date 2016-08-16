'use strict';

const contra = require(`contra`);
const WeeklyIssueSubmission = require(`../../../../models/WeeklyIssueSubmission`);

function remove (req, res, next) {
  contra.waterfall([lookupSubmission, found], handle);

  function lookupSubmission (next) {
    const query = { slug: req.params.slug };
    WeeklyIssueSubmission.findOne(query).exec(next);
  }

  function found (submission, next) {
    if (!submission) {
      res.status(404).json({ messages: [`Weekly submission not found`] }); return;
    }
    submission.remove(next);
  }

  function handle (err) {
    if (err) {
      next(err); return;
    }
    res.json({});
  }
}

module.exports = remove;
