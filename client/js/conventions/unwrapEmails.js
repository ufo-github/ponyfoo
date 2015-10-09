'use strict';

var $ = require('dominus');
var taunus = require('taunus');

function unwrapEmails () {
  taunus.on('render', rendered);
}

function rendered (container) {
  $('[data-email]', container).forEach(restore);
  function restore (el) {
    var $el = $(el);
    $el.attr('href', $el.attr('data-email'));
  }
}
module.exports = unwrapEmails;
