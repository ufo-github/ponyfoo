'use strict';

var taunus = require('taunus');

function updateView (elem) {
  var twitter = global.twttr;
  if (twitter && twitter.widgets) {
    twitter.widgets.load(elem);
  }
}

taunus.on('render', updateView);

module.exports = {
  updateView: updateView
};
