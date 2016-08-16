'use strict';

const $ = require(`dominus`);
const taunus = require(`taunus`);
const main = $.findOne(`.ly-main`);
const env = require(`../lib/env`);
const property = env(`GA_PROPERTY`);

module.exports = function ga () {
  if (!property) {
    return;
  }

  require(`./ga-snippet`)();

  global.ga(`create`, property, `auto`);
  taunus.on(`render`, render);

  function render (container) {
    if (container === main) {
      global.ga(`send`, `pageview`);
    }
  }
};
