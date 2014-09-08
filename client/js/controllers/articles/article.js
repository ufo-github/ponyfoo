'use strict';

var $ = require('dominus');
var comments = require('./comments');

module.exports = function (viewModel) {
  var composer = $('.mc-composer');
  var commentsModel = {
    user: viewModel.user,
    article: viewModel.article,
    measly: viewModel.measly.layer({
      context: composer
    })
  };
  comments(commentsModel);
};
