'use strict';

function analytics (env) {
  require('./vendor/twitter.widget');
  require('./vendor/codepen');
  if (env !== 'production') {
    return;
  }
  require('./vendor/ga');
  require('./vendor/clicky');
}

module.exports = analytics;
