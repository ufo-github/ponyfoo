'use strict';

var $ = require('dominus');
var taunus = require('taunus');
var isElementInViewport = require('../lib/isElementInViewport');
var logo = $('.go-anchor');
var loader = logo
  .clone()
  .appendTo(document.body)
  .addClass('ll-loading')
  .addClass('gg-continuous');

function show () {
  var justLogo = isElementInViewport(logo[0], false);
  if (!justLogo) {
    loader.addClass('ll-show');
  }
  logo.addClass('gg-continuous');
}

function hide () {
  logo.removeClass('gg-continuous');
  loader.removeClass('ll-show');
}

function loading () {
  taunus.on('fetch.start', show);
  taunus.on('fetch.done', hide);
  taunus.on('fetch.abort', hide);
  taunus.on('fetch.error', hide);
}

loading.show = show;
loading.hide = hide;
module.exports = loading;
