'use strict';

var correcthorse = require('correcthorse');
var WeeklyIssue = require('../../../models/WeeklyIssue');

module.exports = function (req, res, next) {
  var slug = req.params.slug;

  res.viewModel = {
    model: {
      title: 'Weekly Assembler',
      weeklyIssue: {
        sections: [],
        hn: false,
        lobsters: false,
        slug: correcthorse()
      },
      editing: !!slug
    }
  };

  if (slug) {
    WeeklyIssue.findOne({ slug: slug }).lean().exec(find);
  } else {
    next();
  }

  function find (err, weeklyIssue) {
    if (err) {
      next(err); return;
    }
    if (!weeklyIssue) {
      res.status(404).json({ messages: ['Weekly issue not found'] }); return;
    }
    res.viewModel.model.weeklyIssue = weeklyIssue;
    next();
  }
};
