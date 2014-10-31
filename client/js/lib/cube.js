'use strict';

var $ = require('dominus');
var cube = $('.pc-cube').addClass('pc-smooth');

function show () {
  cube.addClass('pc-show');
}

function hide () {
  cube.removeClass('pc-show');
}

module.exports = {
  show: show,
  hide: hide
};
