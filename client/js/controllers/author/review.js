'use strict';

var $ = require('dominus');

module.exports = function (viewModel) {
  var container = $('.ar-container');
  var recompute = $('.ar-recompute');

  container.on('click', '.ic-remove', remove);
  recompute.on('click', recomputeRelated);

  function remove (e) {
    var target = $(e.target);
    var slug = target.attr('data-slug');
    var endpoint = '/api/articles/' + slug;

    viewModel.measly.delete(endpoint).on('data', removeRow);

    function removeRow () {
      target.parents('tr').remove();
    }
  }

  function recomputeRelated () {
    recompute.attr('disabled', true);

    viewModel.measly
      .post('/api/articles/compute-relationships')
      .on('data', enable);

    function enable () {
      recompute.attr('disabled', false);
    }
  }
};
