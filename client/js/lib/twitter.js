'use strict';

var taunus = require('taunus');

function updateView (elem) {
  var twitter = global.twttr;
  if (twitter && twitter.widgets) {
    twitter.widgets.load(elem);
  }
}

taunus.on('render', function (container, viewModel) {
  updateView(container);
});

module.exports = {
  updateView: updateView
};
