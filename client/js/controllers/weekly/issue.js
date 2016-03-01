'use strict';

var $ = require('dominus');
var comments = require('../comments/all');

module.exports = function (viewModel, container) {
  if (viewModel.issue.status !== 'released') {
    return;
  }
  var composer = $('.mc-composer', container);
  var commentsModel = {
    user: viewModel.user,
    parent: viewModel.issue,
    parentType: 'weeklies',
    measly: viewModel.measly.layer({
      context: composer[0]
    })
  };
  comments(commentsModel, container);
};
