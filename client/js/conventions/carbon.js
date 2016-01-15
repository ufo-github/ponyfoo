'use strict';

var $ = require('dominus');
var taunus = require('taunus');
var loadScript = require('../lib/loadScript');
var placement = 'https://cdn.carbonads.com/carbon.js?zoneid=1673&serve=C6AILKT&placement=ponyfoocom';
var options = {
  container: $.findOne('.ca-content'),
  id: '_carbonads_js'
};
var script = loadScript(placement, options, loaded);
var timer;

function loaded () {
  timer = setTimeout(helpMePay, 5000);
}

function carbon () {
  taunus.once('change', track);
}

function track () {
  taunus.on('change', changed);
}

function changed () {
  options.container = $.findOne('.ca-content', taunus.state.container);
  if (timer) {
    clearTimeout(timer);
  }
  if (!options.container) {
    return;
  }
  if (global._carbonads) {
    options.container.appendChild(script);
    global._carbonads.refresh();
  }
  timer = setTimeout(helpMePay, 5000);
}

function helpMePay () {
  var blocked = $('#carbonads').length === 0;
  if (blocked) {
    $('.ca-blocked').removeClass('uv-hidden');
  } else {
    $('.ca-blocked').addClass('uv-hidden');
  }
  timer = false;
}

module.exports = carbon;
