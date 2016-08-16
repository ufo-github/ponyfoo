'use strict';

const $ = require(`dominus`);
const taunus = require(`taunus`);
const searchUrlService = require(`../../../services/searchUrl`);

function searchConvention () {
  taunus.on(`render`, render);
}

function render (container) {
  const input = $(`.sr-input`, container);
  $(`.sr-button`, container).on(`click`, search);
  function search (e) {
    e.preventDefault();
    const terms = input.value();
    const route = searchUrlService.compile(terms);
    if (route) {
      taunus.navigate(route);
    }
  }
}

module.exports = searchConvention;
