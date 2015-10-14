'use strict';

// source: https://github.com/dperini/ContentLoaded/blob/81d12c3f130db77e78b97adf6be5d0af8fc16306/src/contentloaded.js
function contentLoaded(win, fn, alwaysOnload) {

  var done = false, top = true,

  doc = win.document,
  root = doc.documentElement,
  modern = doc.addEventListener,

  add = modern ? 'addEventListener' : 'attachEvent',
  rem = modern ? 'removeEventListener' : 'detachEvent',
  pre = modern ? '' : 'on',

  init = function(e) {
    if (e.type == 'readystatechange' && doc.readyState != 'complete') return;
    (e.type == 'load' ? win : doc)[rem](pre + e.type, init, false);
    if (!done && (done = true)) fn.call(win, e.type || e);
  },

  poll = function() {
    try { root.doScroll('left'); } catch(e) { setTimeout(poll, 50); return; }
    init('poll');
  };

  if (doc.readyState == 'complete') fn.call(win, 'lazy');
  else {
    if (!modern && root.doScroll) {
      try { top = !win.frameElement; } catch(e) { }
      if (top) poll();
    }
    if (!alwaysOnload) {
      doc[add](pre + 'DOMContentLoaded', init, false);
      doc[add](pre + 'readystatechange', init, false);
    }
    win[add](pre + 'load', init, false);
  }

}

module.exports = contentLoaded;
