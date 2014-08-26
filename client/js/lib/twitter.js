'use strict';

function updateView (elem) {
  if (window.twttr.widgets) {
    window.twttr.widgets.load(elem);
  }
}

module.exports = {
  updateView: updateView
};
