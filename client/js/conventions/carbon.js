'use strict';

var $ = require('dominus');
var taunus = require('taunus');
var timer = false;
var placement = 'https://cdn.carbonads.com/carbon.js?zoneid=1673&serve=C6AILKT&placement=ponyfoocom';
var options = {
  container: $.findOne('.ca-content'),
  id: '_carbonads_js'
};

require('../lib/loadScript')(placement, options);

function carbon () {
  taunus.on('change', changed);
  timer = setTimeout(helpMePay, 7000);
}

function changed () {
  options.container = $.findOne('.ca-content', taunus.state.container);
  if (timer) {
    clearTimeout(timer);
    timer = setTimeout(helpMePay, 7000);
  }
  if (global._carbonads) {
    global._carbonads.refresh();
  }
}

function helpMePay () {
  var ad = $('#carbonads').length !== 0;
  if (ad === false) {
    $('.ca-help-me').removeClass('uv-hidden');
  }
  timer = false;
}

module.exports = carbon;
