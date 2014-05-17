'use strict';

var flexarea = require('flexarea');

module.exports = function () {
  var ta = document.querySelectorAll('.ac-textarea');
  Array.prototype.forEach.call(ta, flexarea);
};
