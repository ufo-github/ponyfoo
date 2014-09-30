'use strict';

var datauri = new Image();
var result;
var deferred = [];

datauri.onload = load;
datauri.onerror = error;
datauri.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';

function load () {
  set(datauri.width === 1 && datauri.height === 1);
}

function error () {
  set(false);
}

function set (value) {
  if (result) {
    return;
  }
  result = value;
  resulted();
}

function resulted () {
  deferred.forEach(function (d) {
    test(d[0], d[1]);
  });
  deferred = null;
}

function test (success, failure) {
  if (result) {
    success();
  } else if (result === false) {
    failure();
  } else {
    deferred.push([success, failure]);
  }
}

module.exports = test;
