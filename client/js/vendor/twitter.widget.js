'use strict';

const loadScript = require(`../lib/loadScript`);

module.exports = function twitterWidget () {
  loadScript(`https://platform.twitter.com/widgets.js`);

  global.twttr = {
    _e: [],
    ready: ready
  };

  function ready (f) {
    global.twttr._e.push(f);
  }
};
