'use strict';

const contra = require(`contra`);
const assign = require(`assignment`);
const correcthorse = require(`correcthorse`);
const WeeklyIssue = require(`../../../models/WeeklyIssue`);
const WeeklyIssueSubmission = require(`../../../models/WeeklyIssueSubmission`);
const weeklyCompilerService = require(`../../../services/weeklyCompiler`);
const datetimeService = require(`../../../services/datetime`);
const markupService = require(`../../../services/markup`);
const env = require(`../../../lib/env`);
const authority = env(`AUTHORITY`);

module.exports = function (req, res, next) {
  const slug = req.params.slug;
  const tasks = {
    issue: findWeeklyIssue,
    submissions: findAcceptedSubmissions
  };
  contra.concurrent(tasks, respond);

  function findWeeklyIssue (next) {
    if (!slug) {
      next(null); return;
    }
    WeeklyIssue
      .findOne({ slug: slug })
      .lean()
      .exec(find);

    function find (err, issue) {
      if (err) {
        next(err); return;
      }
      if (!issue) {
        res.status(404).json({ messages: [`Weekly issue not found`] }); return;
      }
      next(null, issue);
    }
  }

  function findAcceptedSubmissions (next) {
    WeeklyIssueSubmission
      .find({ status: `accepted` })
      .lean()
      .exec(next);
  }

  function respond (err, result) {
    if (err) {
      next(err); return;
    }
    const issueModel = result.issue || getDefaultIssueModel();
    const publication = issueModel.publication || new Date();
    issueModel.publication = datetimeService.field(publication);
    res.viewModel = {
      model: {
        title: `Weekly Assembler \u2014 Pony Foo`,
        issue: issueModel,
        submissions: result.submissions.map(toSubmissionModel),
        editing: !!slug,
        knownTags: weeklyCompilerService.knownTags
      }
    };
    next();
  }
};

function toSubmissionModel (submission) {
  const id = submission._id.toString();
  const section = assign({}, submission.section, {
    titleHtml: markupService.compile(submission.section.title)
  });
  return { id: id, section: section };
}

function getDefaultIssueModel () {
  return {
    status: `draft`,
    slug: correcthorse(),
    summary: [
      `We're glad you could make it this week! 💌`,
      ``,
      `With your help, we can make Pony Foo Weekly *even more* awesome: [send tips about cool resources][tips].`,
      ``,
      `[tips]: ` + authority + `/weekly/submissions`
    ].join(`\n`),
    sections: [{
      type: `header`,
      text: `Oh, hai! 🎉`
    }]
  };
}
