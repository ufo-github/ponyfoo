'use strict';

var $ = require('dominus');
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

module.exports = {
  show: show,
  hide: hide
};
