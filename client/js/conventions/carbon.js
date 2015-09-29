'use strict';

var $ = require('dominus');
var taunus = require('taunus');
var timer = false;

function carbon () {
  taunus.on('change', changed);
  timer = setTimeout(helpMePay, 7000);
}

function changed () {
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
