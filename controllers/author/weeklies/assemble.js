'use strict';

var WeeklyIssue = require('../../../models/WeeklyIssue');

module.exports = function (req, res, next) {
  var slug = req.params.slug;

  res.viewModel = {
    model: {
      title: 'Weekly Assembler',
      weeklyIssue: {},
      editing: !!slug
    }
  };

  if (slug) {
    WeeklyIssue.findOne({ slug: slug }).lean().exec(populate);
  } else {
    next();
  }

  function populate (err, weeklyIssue) {
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
