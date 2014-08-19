'use strict';

var $ = require('dominus');

module.exports = function (viewModel) {
  var container = $('.ar-container');

  container.on('click', '.ic-remove', remove);

  function remove (e) {
    var id = $(e.target).attr('data-id');

    viewModel.measly.delete('/api/articles/' + id);
  }
};
