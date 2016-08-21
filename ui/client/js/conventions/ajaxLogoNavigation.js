'use strict';

const $ = require(`dominus`);
const taunus = require(`taunus`);

function ajaxLogoNavigation () {
  $(`.go-logo`).on(`left-click`, hijack);
}

function hijack (e) {
  taunus.navigate(`/`);
  e.preventDefault();
}

module.exports = ajaxLogoNavigation;
