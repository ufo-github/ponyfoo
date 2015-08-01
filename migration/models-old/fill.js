'use strict';

var winston = require('winston');
var path = require('path');
var glob = require('glob');

function load (pattern, conn) {
  var modules = glob.sync(pattern, { cwd: __dirname });
  var index = modules.indexOf(path.basename(__filename));
  if (index !== -1) {
    modules.splice(index, 1);
  }
  return modules.map(function (module) {
    return unwrap(conn, module);
  });
}

function unwrap (conn, file) {
  // winston.debug('Loading OLD %s model', file.replace(/\.js$/, ''));
  return require(path.join(__dirname, file))(conn);
}

module.exports = function (conn) {
  load('*.js', conn);
};
