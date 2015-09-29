'use strict';

var $ = require('dominus');
var taunus = require('taunus');
var moment = require('moment');

function relativeTime () {
  taunus.on('render', render);
}

function render (container) {
  $('.rt-relative', container).forEach(relative);
}

function relative (el) {
  var time = $(el);
  var absolute = moment(time.attr('datetime'));
  time.text(absolute.fromNow());
}

module.exports = relativeTime;
