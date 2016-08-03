'use strict';

var $ = require('dominus');
var raf = require('raf');
var debounce = require('lodash/function/debounce');
var refreshScrollSlowly = raf.bind(null, debounce(refreshScroll, 5));
var body = document.body;
var html = document.documentElement;

function init () {
  $(window).on('scroll', refreshScrollSlowly);
  refreshScroll();
}

function refreshScroll () {
  var position = (window.pageYOffset || html.scrollTop) - (html.clientTop || 0);
  var documentHeight = Math.max(
    body.scrollHeight,
    body.offsetHeight,
    html.clientHeight,
    html.scrollHeight,
    html.offsetHeight
  );
  var viewportHeight = Math.max(html.clientHeight, window.innerHeight || 0);
  var scrolled = position / (documentHeight - viewportHeight) * 100;
  var negated = 100 - scrolled;
  var visible = scrolled > 6;
  var show = visible ? 'removeClass' : 'addClass';
  $('.sp-line-wrapper')[show]('uv-hidden');
  $('.sp-line').css('width', negated + '%');
}

module.exports = init;
