'use strict';

const but = require(`but`);
const contra = require(`contra`);
const WeeklyIssueSubmission = require(`../../../../models/WeeklyIssueSubmission`);
const WeeklyIssue = require(`../../../../models/WeeklyIssue`);
const weeklyService = require(`../../../../services/weekly`);

function push (req, res, next) {
  contra.concurrent({
    submission: findSubmission,
    issue: findLatestIssue
  }, compute);

  function findSubmission (next) {
    const { slug } = req.params;
    WeeklyIssueSubmission.findOne({ slug }, next);
  }

  function findLatestIssue (next) {
    WeeklyIssue
      .findOne({ status: `draft` })
      .sort([[`publication`, -1], [`created`, -1]])
      .exec(next);
  }

  function compute (err, { submission, issue } = {}) {
    if (err) {
      next(err); return;
    }
    if (!issue) {
      res.status(404).json({ messages: [`No Pony Foo Weekly drafts were found! Please create one.`] }); return;
    }
    const { section } = req.body;
    weeklyService.addSection({ issue, section }, added);

    function added (err) {
      if (err) {
        next(err); return;
      }
      if (submission.status === `incoming`) {
        submission.status = `used`;
      }
      submission.accepted = true;
      submission.save(but(respond));
    }

    function respond (err) {
      if (err) {
        next(err); return;
      }
      res.json({});
    }
  }
}

module.exports = push;
