'use strict';

var $ = require('dominus');

module.exports = function (viewModel) {
  var container = $('.ar-container');

  container.on('click', '.ic-remove', remove);

  function remove (e) {
    var slug = $(e.target).attr('data-slug');

    viewModel.measly.delete('/api/articles/' + slug);
  }
};
