'use strict';

require('./ga-snippet');

var $ = require('dominus');
var taunus = require('taunus');
var main = $.findOne('.ly-main');
var property = 'UA-35043128-3';

ga('create', property, 'auto');

taunus.on('render', function (container, viewModel) {
  if (container === main) {
    ga('send', 'pageview');
  }
});
