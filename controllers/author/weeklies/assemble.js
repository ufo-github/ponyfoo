'use strict';

var correcthorse = require('correcthorse');
var WeeklyIssue = require('../../../models/WeeklyIssue');
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
      sections: [],
      hn: false,
      lobsters: false
    };
    var issueModel = issue || defaults;
    issueModel.publication = datetimeService.field(issueModel.publication || new Date());
    res.viewModel = {
      model: {
        title: 'Weekly Assembler \u2014 Pony Foo',
        issue: issueModel,
        editing: !!slug
      }
    };
  }
};
