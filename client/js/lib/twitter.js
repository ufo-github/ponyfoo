'use strict';

var taunus = require('taunus');

function updateView (elem) {
  if (global.twttr.widgets) {
    global.twttr.widgets.load(elem);
  }
}

taunus.on('render', function (container, viewModel) {
  updateView(container);
});

module.exports = {
  updateView: updateView
};
