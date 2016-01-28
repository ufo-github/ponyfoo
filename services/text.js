'use strict';

var sluggish = require('sluggish');
var hyphenated = /-([a-z])/g;
var spaces = /\s+/g;

function truthy (value) {
  return !!value;
}

function unique (results, item) {
  if (results.indexOf(item) === -1) {
    results.push(item);
  }
  return results;
}

function splitTags (text) {
  return text.trim().toLowerCase().split(spaces).filter(truthy).reduce(unique, []);
}

function format () {
  var args = Array.prototype.slice.call(arguments);
  var initial = args.shift();

  function replacer (text, replacement) {
    return text.replace('%s', replacement);
  }
  return args.reduce(replacer, initial);
}

function hyphenToCamel (text) {
  return text.replace(hyphenated, upperCase);
}

function upperCase (m, g) {
  return g.toUpperCase();
}

module.exports = {
 splitTags: splitTags,
 format: format,
 hyphenToCamel: hyphenToCamel
};
