'use strict';

var correcthorse = require('correcthorse');
var WeeklyIssue = require('../../../models/WeeklyIssue');
var weeklyCompilerService = require('../../../services/weeklyCompiler');
var datetimeService = require('../../../services/datetime');

module.exports = function (req, res, next) {
  var slug = req.params.slug;
  if (slug) {
    WeeklyIssue.findOne({ slug: slug }).lean().exec(find);
  } else {
    setModel();
    next();
  }

  function find (err, issue) {
    if (err) {
      next(err); return;
    }
    if (!issue) {
      res.status(404).json({ messages: ['Weekly issue not found'] }); return;
    }
    setModel(issue);
    next();
  }

  function setModel (issue) {
    var defaults = {
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
    var issueModel = issue || defaults;
    issueModel.publication = datetimeService.field(issueModel.publication || new Date());
    res.viewModel = {
      model: {
        title: 'Weekly Assembler \u2014 Pony Foo',
        issue: issueModel,
        editing: !!slug,
        knownTags: weeklyCompilerService.knownTags
      }
    };
  }
};
