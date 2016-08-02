'use strict';

var $ = require('dominus');
var taunus = require('taunus');

module.exports = function (viewModel) {
  var container = $('.ar-container');
  var compute = $('.ar-recompute');

  container.on('click', '.ar-remove', edit(remove, 'delete'));
  container.on('click', '.ar-restore', edit(restore));
  container.on('click', '.ar-trash', edit(trash, 'permanently delete'));
  compute.on('click', computeRelated);

  function edit (fn, action) {
    return function editHandler (e) {
      var target = $(e.target);
      var slug = target.attr('data-slug');
      var confirmation = getConfirmation(action, slug);
      if (!confirmation) {
        return;
      }
      var endpoint = '/api/articles/' + slug;
      fn(endpoint).on('data', refresh);
      function refresh () {
        taunus.navigate('/articles/review', { force: true });
      }
    };
  }

  function remove (endpoint) {
    return viewModel.measly.delete(endpoint);
  }
  function restore (endpoint) {
    return viewModel.measly.post(endpoint + '/restore');
  }
  function trash (endpoint) {
    return viewModel.measly.delete(endpoint + '/force');
  }

  function getConfirmation (action, slug) {
    if (!action) {
      return true;
    }
    return confirm('About to ' + action + ' /articles/' + slug + ', are you sure?');
  }

  function computeRelated (e) {
    var okay = confirm('Are you sure you want to recompute relationships for every single article?');
    if (!okay) {
      e.preventDefault();
      e.stopPropagation();
    }
  }
};
