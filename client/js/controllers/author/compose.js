'use strict';

var $ = require('dominus');
var flexarea = require('flexarea');
var ponymark = require('ponymark');

module.exports = function () {
  var texts = $('.ac-text');

  texts.forEach(ponymark);
  texts.find('.pmk-input').forEach(flexarea);
};
