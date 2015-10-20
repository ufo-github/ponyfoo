'use strict';

var $ = require('dominus');
var taunus = require('taunus/global');
var searchUrlService = require('../../../services/searchUrl');

function searchConvention () {
  taunus.on('render', render);
}

function render (container) {
  var input = $('.sr-input', container);
  $('.sr-button', container).on('click', search);
  function search (e) {
    e.preventDefault();
    var terms = input.value();
    var route = searchUrlService.compile(terms);
    if (route) {
      taunus.navigate(route);
    }
  }
}

module.exports = searchConvention;
