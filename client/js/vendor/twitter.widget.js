'use strict';

require('../lib/loadScript')('https://platform.twitter.com/widgets.js');

global.twttr = {
  _e: [],
  ready: function (f) {
    t._e.push(f)
  }
};
