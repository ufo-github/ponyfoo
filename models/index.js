'use strict';

var path = require('path');
var glob = require('glob');

function load () {
  var modules = glob.sync('*.js', { cwd: __dirname });
  delete modules['index.js'];
  return modules.map(unwrap);
}

function unwrap (file) {
  return require(path.join(__dirname, file));
}

module.exports = load;
