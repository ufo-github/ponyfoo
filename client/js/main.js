'use strict';

require('./vendor/twitter.widget');

var $ = require('dominus');
var jade = require('jade/runtime');
var ponymark = require('ponymark');
var taunus = require('taunus');
var moment = require('moment');
var markdownService = require('../../services/markdown');
var setupMeasly = require('./setupMeasly');

require('./vendor/ga');
require('./lib/twitter');

global.$ = $; // merely for debugging convenience
global.jade = jade; // let jade have it their way
global.moment = moment; // let rome use our moment instance

var wiring = require('./wiring');
var main = $.findOne('.ly-main');

ponymark.configure({
  markdown: markdownService.compile,
  imageUploads: '/api/markdown/images'
});

setupMeasly();

taunus.mount(main, wiring);
