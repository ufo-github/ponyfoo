'use strict';

const $ = require('dominus');
const taunus = require('taunus');
const moment = require('moment');

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
  const time = $(el);
  const absolute = moment(time.attr('datetime'));
  time.text(absolute.fromNow());
}

module.exports = relativeTime;
