'use strict';

var $ = require('dominus');
var taunus = require('taunus');
var moment = require('moment');
var markdownService = require('../../services/markdown');
var conventions = require('./conventions');
var analytics = require('./analytics');
var wiring = require('./wiring');
var main = $.findOne('.ly-main');
var g = global;

require('hint');

taunus.on('start', function (container, viewModel) {
  require('./search');
  require('./subscriptions');
  analytics(viewModel.env);
  require('./welcome')(viewModel);
});

conventions();

taunus.mount(main, wiring, { cache: true, prefetch: true, bootstrap: 'manual' });

g.$ = $;
g.md = markdownService.compile;
g.moment = moment;
