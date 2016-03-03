'use strict';

var $ = require('dominus');
var taunus = require('taunus');

module.exports = function (viewModel, container) {
  var liveCheck = $('.wr-live', container);
  var table = $('.wr-container', container);

  liveCheck.on('click', toggle);
  table.on('click', '.wr-remove', remove);

  function toggle () {
    viewModel.measly
      .post('/api/settings/PONYFOOWEEKLY_CRON', {
        json: { value: !viewModel.live }
      })
      .on('data', refresh);
    function refresh () {
      taunus.navigate('/author/weeklies', { force: true });
    }
  }

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
