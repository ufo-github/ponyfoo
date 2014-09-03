'use strict';

var $ = require('dominus');
var comments = require('./comments');

module.exports = function (viewModel) {
  var container = $('.mc-container');
  var commentsModel = {
    article: viewModel.article,
    measly: viewModel.measly.layer({
      context: container
    })
  };
  comments(commentsModel);
};
