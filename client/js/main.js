'use strict';

var ponymoo = require('ponymoo');
var routing = require('./routing');
var main = document.querySelector('.ly-main');

ponymoo.boot(main, routing);
