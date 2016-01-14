'use strict';

var $ = require('dominus');
var taunus = require('taunus/global');
var main = $.findOne('.ly-main');
var env = require('../lib/env');
var property = env('GA_PROPERTY');

module.exports = function ga () {
  if (!property) {
    return;
  }

  require('./ga-snippet')();

  global.ga('create', property, 'auto');
  taunus.on('render', render);

  function render (container, viewModel) {
    if (container === main) {
      global.ga('send', 'pageview');
    }
  }
};
