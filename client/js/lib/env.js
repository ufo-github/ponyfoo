'use strict';

var env = require('../../../.env.browser.json');

function accessor (key) {
  return env[key] || null;
}

accessor.raw = env;
module.exports = accessor;
