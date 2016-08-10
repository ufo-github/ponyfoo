'use strict';

const $ = require('dominus');
const comments = require('../comments/all');

module.exports = function (viewModel, container) {
  const composer = $('.mc-composer', container);
  if (!composer.length) {
    return;
  }
  const commentsModel = {
    user: viewModel.user,
    parent: viewModel.issue,
    parentType: 'weeklies',
    measly: viewModel.measly.layer({
      context: composer[0]
    })
  };
  comments(commentsModel, container);
};
