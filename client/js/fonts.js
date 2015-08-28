'use strict';

var fontfaceonload = require('fontfaceonload');

function wait () {
  fontfaceonload('Merriweather', {
    success: success('ly-merriweather')
  });
  fontfaceonload('Cardo', {
    weight: 700,
    success: success('ly-cardo')
  });
}
function success (className) {
  return function loaded () {
    document.documentElement.className += ' ' + className;
  };
}

module.exports = wait;
