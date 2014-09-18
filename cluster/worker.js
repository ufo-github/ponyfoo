'use strict';

var path = require('path');
var pkg = manifest();
var app = path.resolve('../..', pkg.version, 'app.js');

console.log('Worker %s executing app@%s', process.pid, pkg.version);
run();

function manifest () {
  try { // in hosted environments, use the latest known deployed version
    return require('../../../package.json');
  } catch (e) { // fall back to local
    return require('../package.json');
  }
}

function run () {
  try {
    require(app);
  } catch (e) { // fall back to local
    require('../app');
  }
}
