'use strict';

function analytics (env) {
  if (env.name !== 'production') {
    return;
  }
  require('./vendor/ga');
  require('./vendor/clicky');
  require('./vendor/twitter.widget');
  require('./lib/twitter');
}

module.exports = analytics;
