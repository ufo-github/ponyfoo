'use strict';

var $ = require('dominus');
var taunus = require('taunus');

function bind () {
  taunus.on('render', unwrapFrames);
}

function unwrapFrames (container) {
  $(container).find('iframe[data-src]').forEach(unwrap);
}

function unwrap (iframe) {
  iframe.src = iframe.getAttribute('data-src');
  iframe.removeAttribute('data-src');
}

module.exports = bind;
