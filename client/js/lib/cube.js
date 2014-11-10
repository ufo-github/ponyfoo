'use strict';

var $ = require('dominus');
var cube = $('.pc-cube').addClass('pc-smooth');

function show (route, context) {
  if (context.source === 'intent') {
    cube.addClass('pc-show');
  }
}

function hide (route, context) {
  if (context.source === 'intent') {
    cube.removeClass('pc-show');
  }
}

module.exports = {
  show: show,
  hide: hide
};
