'use strict';

function get (key) {
  var data = localStorage.getItem(key);
  if (data) {
    return JSON.parse(data);
  }
  return data;
}

function set (key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

module.exports = {
  get: get,
  set: set
};
