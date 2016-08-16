'use strict';

const $ = require(`dominus`);

function unwrapImages (container) {
  $(container).find(`img[data-src]`).forEach(unwrap);
}

function unwrap (img) {
  img.src = img.getAttribute(`data-src`);
  img.removeAttribute(`data-src`);
}

module.exports = unwrapImages;
