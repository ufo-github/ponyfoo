'use strict';

var fontfaceonload = require('fontfaceonload');

function wait () {
  fontfaceonload('Merriweather', {
    success: success('ly-teasers')
  });
  fontfaceonload('Neuton', {
    weight: 700,
    success: success('ly-custom-headings')
  });
}
function success (className) {
  return function loaded () {
    document.documentElement.className += ' ' + className;
  };
}

module.exports = wait;
