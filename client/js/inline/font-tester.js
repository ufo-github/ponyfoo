'use strict';

var fontfaceonload = require('fontfaceonload');
var fontfaceonload = global.FontFaceOnload;
var el = document.getElementById('_fonts');

wait(); // used after cache is primed
onloadStyle(el, wait); // cache isn't primed

// source: https://github.com/filamentgroup/loadCSS/blob/1173c13133078b2688505f50af4412142515f4a5/onloadCSS.js
function onloadStyle (el, done) {
  el.onload = loaded;

  if ('isApplicationInstalled' in navigator && 'onloadcssdefined' in el) {
    el.onloadcssdefined(done);
  }
  function loaded () {
    el.onload = null;
    if (done) {
      done.call(el);
    }
  }
}

function wait () {
  fontfaceonload('Merriweather', {
    weight: 700,
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
