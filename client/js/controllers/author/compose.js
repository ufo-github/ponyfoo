'use strict';

var flexarea = require('./flexarea'); // require('flexarea');

module.exports = function () {
  console.log('compose controller');
  var ta = document.querySelectorAll('.ac-textarea');
  Array.prototype.forEach.call(ta, flexarea);
};
