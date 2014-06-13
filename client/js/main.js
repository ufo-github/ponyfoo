'use strict';

var $ = require('dominus');
var jade = require('jade/runtime');
var ponymark = require('ponymark');
var taunus = require('taunus');
var wiring = require('./wiring');
var main = $.findOne('.ly-main');

global.$ = $;
global.jade = jade;

ponymark.configure({
  imageUploads: '/api/markdown/images'
});

taunus.mount(main, wiring);
