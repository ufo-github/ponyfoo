'use strict';

var taunus = require('taunus');
var routes = require('./routes');
var main = document.querySelector('.ly-main');

taunus.mount(main, routes);
