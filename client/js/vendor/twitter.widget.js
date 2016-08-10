'use strict';

module.exports = function twitterWidget () {
  require('../lib/loadScript')('https://platform.twitter.com/widgets.js');

  global.twttr = {
    _e: [],
    ready: ready
  };

  function ready (f) {
    global.twttr._e.push(f);
  }
};
