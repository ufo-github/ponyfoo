'use strict';

var $ = require('domu');
var taunus = require('taunus');
var routes = require('./routes');
var main = $.one('.ly-main');

taunus.mount(main, routes);
