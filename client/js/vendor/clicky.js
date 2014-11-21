'use strict';

var $ = require('dominus');
var taunus = require('taunus/global');
var ga = require('./ga-snippet');
var main = $.findOne('.ly-main');
var property = '100527664';

require('./clicky-snippet');

global.clicky_site_ids = [property];
global.clicky_custom = { timer: 0 };

taunus.on('render', function (container, viewModel) {
  if (container === main && global.clicky) {
    global.clicky.log(global.location.href);
  }
});
