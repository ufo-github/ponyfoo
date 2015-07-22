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
require('./lib/codepen');

conventions();

taunus.on('start', starting);
taunus.mount(main, wiring, { bootstrap: 'manual' });

g.$ = $;
g.md = markdownService.compile;
g.moment = moment;

setTimeout(helpMePay, 7000);

function starting (container, viewModel) {
  require('./search');
  require('./subscriptions');
  analytics(viewModel.env);
  require('./welcome')(viewModel);
  setTimeout(refreshesAd, 0);
}

function helpMePay () {
  var ad = $('#carbonads').length !== 0;
  if (ad === false) {
    $('.ca-help-me').removeClass('uv-hidden');
    taunus.off('change', refreshAd);
  }
}

function refreshesAd () {
  taunus.on('change', refreshAd);
}

function refreshAd () {
  g._carbonads.refresh();
}
