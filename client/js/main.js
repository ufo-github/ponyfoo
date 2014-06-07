'use strict';

var $ = require('dominus');
var taunus = require('taunus');
var routes = require('./routes');
var main = $.findOne('.ly-main');

global.$ = $;

taunus.mount(main, routes);
