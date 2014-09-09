'use strict';

var $ = require('dominus');
var taunus = require('taunus');
var input = $('.sr-input');
var button = $('.sr-button');
var spaces = /\s+/;

button.on('click', search);

function search () {
  var terms = input.value().trim().split(spaces).join('-');
  if (terms) {
    taunus.navigate('/articles/search/' + terms);
  }
}
