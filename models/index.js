'use strict';

var winston = require('winston');
var path = require('path');
var glob = require('glob');

function load (pattern) {
  var modules = glob.sync(pattern, { cwd: __dirname });
  var index = modules.indexOf(path.basename(__filename));
  if (index !== -1) {
    modules.splice(index, 1);
  }
  return modules.map(unwrap);
}

function unwrap (file) {
  winston.debug('Loading %s model', file.replace(/\.js$/, ''));
  return require(path.join(__dirname, file));
}

module.exports = function () {
  load('*.js');
  load('hooks/*.js');
};
