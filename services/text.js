'use strict';

var sluggish = require('sluggish');

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
  var spaces = /\s+/g;
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
  var rhyphenated = /-([a-z0-9])/g;
  return text.replace(rhyphenated, upperCase);
}

function upperCase (all, char) {
  return char.toUpperCase();
}

module.exports = {
 splitTags: splitTags,
 format: format,
 hyphenToCamel: hyphenToCamel
};
