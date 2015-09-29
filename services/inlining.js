'use strict';

var fs = require('fs');
var path = require('path');
var glob = require('glob');
var files = glob.sync('.bin/inlined/*.css');
var cache = files.reduce(reader, {});
var enabled = files.length;

function reader (cache, file) {
  var css = fs.readFileSync(file, 'utf8');
  var component = path.basename(file, '.css');
  cache[component] = css;
  return cache;
}

function addStyles (host, component) {
  if (enabled && component in cache) {
    host.inlineStyles = {
      name: component,
      value: cache[component]
    };
    host.inlineStyles.toJSON = componentName;
  }
  function componentName () {
    return '[' + component + ']'
  }
}

module.exports = {
  addStyles: addStyles
};
