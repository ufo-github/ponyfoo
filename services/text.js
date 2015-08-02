'use strict';

var sluggish = require('sluggish');
var hyphenated = /-([a-z])/g;
var spaces = /\s+/g;

function truthy (value) {
  return !!value;
}

function truncate (text, cap) {
  var i;
  var result = text.trim();
  if (result.length > cap) {
    result = result.substr(0, cap);
    i = result.lastIndexOf(' ');

    if (i !== -1) { // truncate the last word, which may have been trimmed
      result = result.substr(0, i);
    }
    result += ' [...]';
  }
  return result;
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
 slug: sluggish,
 truncate: truncate,
 splitTags: splitTags,
 format: format,
 hyphenToCamel: hyphenToCamel
};
