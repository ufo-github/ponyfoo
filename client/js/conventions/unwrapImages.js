'use strict';

const $ = require(`dominus`);
const taunus = require(`taunus`);
const unwrapImages = require(`../lib/unwrapImages`);
const body = $.findOne(`body`);

function unwrap () {
  taunus.on(`start`, unwrapImages.bind(null, body));
  taunus.on(`render`, unwrapImages);
}

module.exports = unwrap;
