'use strict';

var $ = require('dominus');
var taunus = require('taunus');
var routes = require('./routes');
var main = $.one('.ly-main');

taunus.mount(main, routes);
