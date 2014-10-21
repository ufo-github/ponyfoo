'use strict';

var $ = require('dominus');
var ponymark = require('ponymark');
var taunus = require('taunus');
var moment = require('moment');
var markdownService = require('../../services/markdown');
var conventions = require('./conventions');
var analytics = require('./analytics');

global.$ = $;
global.moment = moment;
global.taunus = taunus;
global.md = markdownService.compile;

var wiring = require('./wiring');
var main = $.findOne('.ly-main');

require('hint');

taunus.on('start', function (container, viewModel) {
  require('./search');
  require('./subscriptions');
  analytics(viewModel.env);
});

ponymark.configure({
  markdown: markdownService.compile,
  imageUploads: {
    url: '/api/markdown/images',
    timeout: 25000
  }
});

conventions();

taunus.mount(main, wiring);
