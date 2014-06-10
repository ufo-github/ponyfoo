'use strict';

var $ = require('dominus');
var ponymark = require('ponymark');
var taunus = require('taunus');
var wiring = require('./wiring');
var main = $.findOne('.ly-main');

global.$ = $;

ponymark.configure({
  imageUploads: '/api/markdown/images'
});

taunus.mount(main, wiring);
