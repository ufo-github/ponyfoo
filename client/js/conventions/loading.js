'use strict';

var $ = require('dominus');
var taunus = require('taunus');
var loader = $('.go-anchor')
  .clone()
  .appendTo(document.body)
  .addClass('ll-loading')
  .addClass('gg-continuous');

function show () {
  loader.addClass('ll-show');
}

function hide () {
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
