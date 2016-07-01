'use strict';

var contra = require('contra');
var assign = require('assignment');
var correcthorse = require('correcthorse');
var WeeklyIssue = require('../../../models/WeeklyIssue');
var WeeklyIssueSubmission = require('../../../models/WeeklyIssueSubmission');
var weeklyCompilerService = require('../../../services/weeklyCompiler');
var datetimeService = require('../../../services/datetime');
var markupService = require('../../../services/markup');

module.exports = function (req, res, next) {
  var slug = req.params.slug;
  var tasks = {
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
        res.status(404).json({ messages: ['Weekly issue not found'] }); return;
      }
      next(null, issue);
    }
  }

  function findAcceptedSubmissions (next) {
    WeeklyIssueSubmission
      .find({ status: 'accepted' })
      .lean()
      .exec(next);
  }

  function respond (err, result) {
    if (err) {
      next(err); return;
    }
    var issueModel = result.issue || getDefaultIssueModel();
    var publication = issueModel.publication || new Date();
    issueModel.publication = datetimeService.field(publication);
    res.viewModel = {
      model: {
        title: 'Weekly Assembler \u2014 Pony Foo',
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
  var id = submission._id.toString();
  var section = assign({}, submission.section, {
    titleHtml: markupService.compile(submission.section.title)
  });
  return { id: id, section: section };
}

function getDefaultIssueModel () {
  return {
    status: 'draft',
    slug: correcthorse(),
    summary: [
      'We\'re glad you could make it this week! 💌',
      '',
      'If you have any tips, feel free to email us at [tips@ponyfoo.com][tips] _-- or just reply to this email._ You can leave comments on the website.',
      '',
      '[tips]: mailto:tips@ponyfoo.com'
    ].join('\n'),
    sections: [{
      type: 'header',
      text: 'Oh, hai! 🎉'
    }]
  };
}
