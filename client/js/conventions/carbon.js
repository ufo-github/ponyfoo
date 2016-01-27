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
var originalGo;

function loaded () {
  timer = setTimeout(helpMePay, 5000);
  originalGo = global._carbonads_go;
  global._carbonads_go = go;
}

function go (data) {
  patch(data);
  originalGo(data);
  $('#_carbonads_js ~ [id^=carbonads_]').remove(); // remove extra ads if carbon is being weird
}

function patch (data) {
  data.ads.forEach(patchAd);
  function patchAd (ad) {
    try { // fix unsafe image loading for hosts known to support https
      ad.image = patchUnsafeImageHost(ad.image);
    } catch (e) {
    }
  }
}

function patchUnsafeImageHost (image) {
  if (image.indexOf('//') === 0) {
    return 'https:' + image;
  }
  var url = new URL(image);
  if (url.host === 'assets.servedby-buysellads.com' && url.protocol === 'http:') {
    return url.href.replace(/^http:/, 'https:');
  }
  return image;
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
    global._carbonads.reload();
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
