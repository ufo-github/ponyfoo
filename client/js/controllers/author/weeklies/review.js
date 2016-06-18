'use strict';

var $ = require('dominus');
var taunus = require('taunus');

module.exports = function (viewModel, container) {
  var liveCheck = $('.wr-live', container);
  var levelCheck = $('.wr-level', container);
  var table = $('.wr-container', container);

  liveCheck.on('click', toggleCron);
  levelCheck.on('click', toggleLevel);
  table.on('click', '.wr-remove', remove);

  function toggleCron () {
    viewModel.measly
      .post('/api/settings/PONYFOOWEEKLY_CRON', {
        json: { value: !viewModel.live }
      })
      .on('data', refresh);
    function refresh () {
      taunus.navigate('/weekly/review', { force: true });
    }
  }

  function toggleLevel () {
    viewModel.measly
      .post('/api/settings/PONYFOOWEEKLY_CRON_LEVEL', {
        json: { value: viewModel.level === 'info' ? 'debug' : 'info' }
      })
      .on('data', refresh);
    function refresh () {
      taunus.navigate('/weekly/review', { force: true });
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
