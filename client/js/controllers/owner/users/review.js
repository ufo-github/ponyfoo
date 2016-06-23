'use strict';

var $ = require('dominus');

module.exports = function (viewModel) {
  var container = $('.usr-container');

  container.on('click', '.usr-remove', remove);

  function remove (e) {
    var target = $(e.target);
    var id = target.attr('data-id');
    var confirmation = confirm('About to delete /users/' + id + ', are you sure?');
    if (!confirmation) {
      return;
    }
    var endpoint = '/api/users/' + id;

    viewModel.measly.delete(endpoint).on('data', removeRow);

    function removeRow () {
      target.parents('tr').remove();
    }
  }
};
