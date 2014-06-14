'use strict';

var winston = require('winston');
var path = require('path');
var glob = require('glob');

function load () {
  var modules = glob.sync('*.js', { cwd: __dirname });
  var index = modules.indexOf('index.js');
  modules.splice(index, 1);
  return modules.map(unwrap);
}

function unwrap (file) {
  winston.debug('Loading %s model', file.replace(/\.js$/, ''));
  return require(path.join(__dirname, file));
}

module.exports = load;
