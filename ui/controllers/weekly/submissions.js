'use strict';

const env = require(`../../lib/env`);
const WeeklyIssueSubmission = require(`../../models/WeeklyIssueSubmission`);
const staticService = require(`../../services/static`);
const weeklySubmissionService = require(`../../services/weeklySubmission`);
const authority = env(`AUTHORITY`);

module.exports = function (req, res, next) {
  const slug = req.params.slug;
  if (slug) {
    WeeklyIssueSubmission.findOne({ slug: slug }, found);
  } else {
    respond();
  }

  function found (err, submission) {
    if (err) {
      next(err); return;
    }
    if (!submission) {
      next(`route`); return;
    }
    const options = {
      submission: submission,
      userId: req.user,
      verify: req.query.verify
    };
    weeklySubmissionService.isEditable(options, respond);
  }

  function respond (err, submission) {
    if (err) {
      next(err); return;
    }
    res.viewModel = {
      model: {
        meta: {
          canonical: `/weekly/submissions`,
          description: `Suggest links for Pony Foo Weekly or provide us with your sponsored content requests.`,
          images: [authority + staticService.unroll(`/img/ponyfooweekly-sample.png`)]
        },
        title: `Submissions \u2014 Pony Foo Weekly`,
        editing: !!slug,
        submission: toEditModel(submission)
      }
    };
    next();
  }
};

function toEditModel (submission) {
  if (!submission) {
    return { section: {}, dates: [] };
  }
  return {
    type: submission.type,
    subtype: submission.subtype,
    section: {
      href: submission.section.href,
      title: submission.section.title,
      source: submission.section.source,
      sourceHref: submission.section.sourceHref,
      image: submission.section.image,
      description: submission.section.description
    },
    amount: submission.amount,
    invoice: submission.invoice,
    dates: submission.dates,
    submitter: submission.submitter,
    email: submission.email,
    comment: submission.comment
  };
}
