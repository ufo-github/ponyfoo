'use strict';

var path = require('path');
var pkg = manifest();
var app = path.resolve('..', pkg.version, 'app.js');

console.log('Clustnerd %s executing app@%s', process.pid, pkg.version);

require(app);

function manifest () {
  try { // in hosted environments, clustnerd co-operates to always invoke the latest known deployed version
    return require('../../package.json');
  } catch (e) {
    return require('./package.json');
  }
}
