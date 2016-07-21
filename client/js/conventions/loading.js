'use strict';

var $ = require('dominus');
var taunus = require('taunus');
var isElementInViewport = require('../lib/isElementInViewport');
var logo = $.findOne('.go-anchor');
var $logo = $(logo);
var loader = $logo
  .clone()
  .appendTo(document.body)
  .addClass('ll-loading')
  .addClass('gg-continuous');

function show () {
  var justLogo = isElementInViewport(logo, false);
  if (!justLogo) {
    loader.addClass('ll-show');
  }
  $logo.addClass('gg-continuous');
}

function hide () {
  $logo.removeClass('gg-continuous');
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
