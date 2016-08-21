'use strict';

const $ = require(`dominus`);
const taunus = require(`taunus`);
const env = require(`../lib/env`);
const main = $.findOne(`.ly-main`);
const property = env(`CLICKY_PROPERTY`);

module.exports = function clicky () {
  if (!property) {
    return;
  }

  require(`./clicky-snippet`)();

  global.clicky_site_ids = [property];
  global.clicky_custom = { timer: 0 };

  taunus.on(`render`, render);

  function render (container) {
    if (container === main && global.clicky) {
      global.clicky.log(global.location.href);
    }
  }
};
