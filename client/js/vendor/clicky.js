'use strict';

var $ = require('dominus');
var taunus = require('taunus/global');
var env = require('../lib/env');
var main = $.findOne('.ly-main');
var property = env('CLICKY_PROPERTY');

module.exports = function clicky () {
  if (!property) {
    return;
  }

  require('./clicky-snippet')();

  global.clicky_site_ids = [property];
  global.clicky_custom = { timer: 0 };

  taunus.on('render', render);

  function render (container, viewModel) {
    if (container === main && global.clicky) {
      global.clicky.log(global.location.href);
    }
  }
};
