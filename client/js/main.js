'use strict';

var $ = require('dominus');
var jade = require('jade/runtime');
var ponymark = require('ponymark');
var taunus = require('taunus');
var wiring = require('./wiring');
var main = $.findOne('.ly-main');

global.$ = $; // merely for debugging convenience
global.jade = jade; // let jade have it their way

ponymark.configure({
  imageUploads: '/api/markdown/images'
});

taunus.mount(main, wiring);
