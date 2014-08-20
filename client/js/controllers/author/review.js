'use strict';

var $ = require('dominus');

module.exports = function (viewModel) {
  var container = $('.ar-container');

  container.on('click', '.ic-remove', remove);

  function remove (e) {
    var target = $(e.target);
    var slug = target.attr('data-slug');
    var endpoint = '/api/articles/' + slug;

    viewModel.measly.delete(endpoint).on('data', removeRow);

    function removeRow () {
      target.parents('tr').remove();
    }
  }
};
