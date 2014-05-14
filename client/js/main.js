'use strict';

var taunus = require('taunus');
var routing = require('./routing');
var main = document.querySelector('.ly-main');

taunus.mount(main, routing);
