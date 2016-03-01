'use strict';

var $ = require('dominus');
var taunus = require('taunus');
var moment = require('moment');

function relativeTime () {
  taunus.on('render', adjust);
  setInterval(adjustAll, 18000);
}

function adjustAll () {
  adjust(document.body);
}

function adjust (container) {
  $('time', container).but('[data-absolute]').forEach(relative);
}

function relative (el) {
  var time = $(el);
  var absolute = moment(time.attr('datetime'));
  time.text(absolute.fromNow());
}

module.exports = relativeTime;
