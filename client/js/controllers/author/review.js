'use strict';

var $ = require('dominus');

module.exports = function (viewModel) {
  var container = $('.ar-container');
  var compute = $('.ar-compute');

  container.on('click', '.ic-remove', remove);
  compute.on('click', computeRelated);

  function remove (e) {
    var target = $(e.target);
    var slug = target.attr('data-slug');
    var endpoint = '/api/articles/' + slug;

    viewModel.measly.delete(endpoint).on('data', removeRow);

    function removeRow () {
      target.parents('tr').remove();
    }
  }

  function computeRelated () {
    compute.attr('disabled', true);

    viewModel.measly
      .post('/api/articles/compute-relationships')
      .on('data', enable);

    function enable () {
      compute.attr('disabled', false);
    }
  }
};
