'use strict';

var $ = require('dominus');
var taunus = require('taunus/global');
var main = $.findOne('.ly-main');
var property = 'UA-35043128-3';

require('./ga-snippet');

global.ga('create', property, 'auto');

taunus.on('render', function (container, viewModel) {
  if (container === main) {
    global.ga('send', 'pageview');
  }
});
