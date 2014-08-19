'use strict';

module.exports = function (viewModel) {
  var container = $('.ar-container');

  container.on('click', '.ic-remove', remove);

  function remove () {
    viewModel.measly.delete('/api/articles/' + article._id);
  }
};
