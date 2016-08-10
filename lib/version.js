'use strict';

const pkg = require('../package.json');

function version () {
  return pkg.version;
}

module.exports = version;
