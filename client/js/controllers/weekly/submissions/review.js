'use strict';

var $ = require('dominus');

module.exports = function (viewModel, container) {
  var table = $('.wur-container', container);

  table.on('click', '.wur-remove', remove);

  function remove (e) {
    var target = $(e.target);
    var slug = target.attr('data-slug');
    var confirmation = confirm('About to delete /weekly/submissions/' + slug + ', are you sure?');
    if (!confirmation) {
      return;
    }
    var endpoint = '/api/weeklies/submissions/' + slug;

    viewModel.measly.delete(endpoint).on('data', removeRow);

    function removeRow () {
      target.parents('tr').remove();
    }
  }
};
