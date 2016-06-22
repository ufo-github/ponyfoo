'use strict';

var $ = require('dominus');
var taunus = require('taunus');
var body = $.findOne('body');

function bind () {
  taunus.on('start', unwrapEmails.bind(null, body));
  taunus.on('render', unwrapEmails);
}

function unwrapEmails (container) {
  $(container).find('[data-email]').forEach(restore);
  function restore (el) {
    var $el = $(el);
    $el.attr('href', $el.attr('data-email'));
  }
}
module.exports = bind;
