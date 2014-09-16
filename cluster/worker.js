'use strict';

var path = require('path');
var pkg = manifest();
var app = path.resolve('../..', pkg.version, 'app.js');

console.log('Worker %s executing app@%s', process.pid, pkg.version);

function manifest () {
  try { // in hosted environments, attempt to invoke the latest known deployed version
    return require('../../../package.json');
  } catch (e) {
    return require('../package.json'); // fall back to local
  }
}

function run () {
  try {
    require(app);
  } catch (e) {
    require('../app'); // fall back to local
  }
}

run();
