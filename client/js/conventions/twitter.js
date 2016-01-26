'use strict';

var taunus = require('taunus/global');

function updateView (elem) {
  var twitter = global.twttr;
  if (twitter && twitter.widgets) {
    twitter.widgets.load(elem);
  }
}

function twitter () {
  taunus.on('start', updateView.bind(null, document.body));
  taunus.on('render', updateView);
}

twitter.updateView = updateView;

module.exports = twitter;
