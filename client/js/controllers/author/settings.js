'use strict';

const $ = require('dominus');
const taunus = require('taunus');

module.exports = function (viewModel, container) {
  const settings = $.findOne('.asg-settings', container);

  $('.asg-new', container).on('click', add);
  $(settings).on('click', '.asg-remove', remove);

  function add () {
    taunus.partial.appendTo(settings, 'author/setting', { key: '', value: '' });
  }
  function remove (e) {
    $(e.target).parents('.asg-setting').remove();
  }
};
