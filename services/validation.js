'use strict';

var validator = require('validator');

function integer (value, defaultValue) {
  var casted = validator.toInt(value || defaultValue);
  return !isNaN(casted) && casted || defaultValue;
}

module.exports = {
  integer: integer
};
