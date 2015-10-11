'use strict';

var path = require('path');
var glob = require('glob');

function load (pattern, accumulator) {
  var modules = glob.sync(pattern, { cwd: __dirname });
  var index = modules.indexOf(path.basename(__filename));
  if (index !== -1) {
    modules.splice(index, 1);
  }
  return modules.map(unwrap).reduce(keys, accumulator || {});

  function keys (accumulator, model, i) {
    var name = path.basename(modules[i], '.js');
    accumulator[name] = model;
    return accumulator;
  }
}

function unwrap (file) {
  return require(path.join(__dirname, file));
}

module.exports = function api () {
  var models = load('*.js', api);
  load('hooks/*.js');
  return models;
};
