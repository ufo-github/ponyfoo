'use strict';

function toMoney (value) {
  var fixed = value.toFixed(2);
  var parts = fixed.split('.');
  var integer = parts[0];
  var result = '.' + parts[1];
  while (integer.length > 3) {
    result = ',' + integer.substr(-3) + result;
    integer = integer.substr(0, integer.length - 3);
  }
  return '$' + integer + result;
}

module.exports = {
  toMoney: toMoney
};
