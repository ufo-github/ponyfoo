'use strict';

var raf = require('raf');
var ls = global.localStorage;

function get (key) {
  var data = ls.getItem(key);
  if (data) {
    return JSON.parse(data);
  }
  return data;
}

function set (key, value) {
  raf(function setter () { // no reason to block the thread
    ls.setItem(key, JSON.stringify(value));
  });
}

function remove (key) {
  ls.removeItem(key);
}

module.exports = {
  get: get,
  set: set,
  remove: remove
};
