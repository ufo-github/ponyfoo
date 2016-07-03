'use strict';

var $ = require('dominus');

module.exports = function (viewModel) {
  var container = $('.ar-container');
  var compute = $('.ar-recompute');

  container.on('click', '.ar-remove', remove);
  compute.on('click', computeRelated);

  function remove (e) {
    var target = $(e.target);
    var slug = target.attr('data-slug');
    var confirmation = confirm('About to delete /articles/' + slug + ', are you sure?');
    if (!confirmation) {
      return;
    }
    var endpoint = '/api/articles/' + slug;

    viewModel.measly.delete(endpoint).on('data', removeRow);

    function removeRow () {
      target.parents('tr').remove();
    }
  }

  function computeRelated (e) {
    var okay = confirm('Are you sure you want to recompute relationships for every single article?');
    if (!okay) {
      e.preventDefault();
      e.stopPropagation();
    }
  }
};
