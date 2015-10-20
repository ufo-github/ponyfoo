'use strict';

var pkg = require('../package.json');

function version () {
  return pkg.version;
}

module.exports = version;
