'use strict';

const $ = require(`dominus`);
const comments = require(`../comments/all`);

module.exports = function (viewModel, container) {
  const composer = $(`.mc-composer`);
  if (!composer.length) {
    return;
  }
  const commentsModel = {
    user: viewModel.user,
    parent: viewModel.article,
    parentType: `articles`,
    measly: viewModel.measly.layer({
      context: composer[0]
    })
  };
  comments(commentsModel, container);
};
