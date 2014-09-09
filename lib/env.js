'use strict';

var nconf = require('nconf');

nconf.use('memory');
nconf.argv();
nconf.env();

nconf.file('private', '.env');
nconf.file('defaults', '.env.defaults');

module.exports = function (key, value) {
  if (arguments.length === 2) {
    return nconf.set(key, value);
  }
  return nconf.get(key);
}
