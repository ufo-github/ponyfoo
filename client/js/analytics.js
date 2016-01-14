'use strict';

function analytics (env) {
  require('./vendor/twitter.widget')();
  require('./vendor/codepen')();
  require('./vendor/ga')();
  require('./vendor/clicky')();
}

module.exports = analytics;
