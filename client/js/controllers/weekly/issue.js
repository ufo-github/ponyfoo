'use strict';

var $ = require('dominus');
var comments = require('../comments/all');

module.exports = function (viewModel, container) {
  var composer = $('.mc-composer', container);
  if (!composer.length) {
    return;
  }
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
