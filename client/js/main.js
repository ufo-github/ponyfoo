'use strict';

var $ = require('dominus');
var ponymark = require('ponymark');
var taunus = require('taunus');
var moment = require('moment');
var markdownService = require('../../services/markdown');
var setupMeasly = require('./setupMeasly');
var analytics = require('./analytics');

global.$ = $;
global.moment = moment;
global.taunus = taunus;
global.md = markdownService.compile;

var wiring = require('./wiring');
var main = $.findOne('.ly-main');

taunus.once('render', function (container, viewModel) {
  analytics(viewModel.env);
  require('./search');
  require('./subscriptions');
});

ponymark.configure({
  markdown: markdownService.compile,
  imageUploads: '/api/markdown/images'
});

setupMeasly();

taunus.mount(main, wiring);
