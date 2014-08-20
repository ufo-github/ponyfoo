'use strict';

var localStorage = global.localStorage;

function get (key) {
  var data = localStorage.getItem(key);
  if (data) {
    return JSON.parse(data);
  }
  return data;
}

function set (key, value) {
  setTimeout(function setter () { // no reason to block the thread
    localStorage.setItem(key, JSON.stringify(value));
  }, 0);
}

function remove (key) {
  localStorage.removeItem(key);
}

module.exports = {
  get: get,
  set: set,
  remove: remove
};
