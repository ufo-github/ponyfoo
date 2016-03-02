'use strict';

var $ = require('dominus');

module.exports = function (viewModel) {
  var container = $('.wr-container');

  container.on('click', '.wr-remove', remove);

  function remove (e) {
    var target = $(e.target);
    var slug = target.attr('data-slug');
    var confirmation = confirm('About to delete /weekly/' + slug + ', are you sure?');
    if (!confirmation) {
      return;
    }
    var endpoint = '/api/weeklies/' + slug;

    viewModel.measly.delete(endpoint).on('data', removeRow);

    function removeRow () {
      target.parents('tr').remove();
    }
  }
};
