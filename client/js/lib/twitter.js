'use strict';

function updateView (elem) {
  if (global.twttr.widgets) {
    global.twttr.widgets.load(elem);
  }
}

module.exports = {
  updateView: updateView
};
