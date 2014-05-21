'use strict';

var $ = require('domu');
var flexarea = require('flexarea');

module.exports = function () {
  var ta = $('.ac-textarea');
  Array.prototype.forEach.call(ta, flexarea);
};
