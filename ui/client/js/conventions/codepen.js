'use strict';

const taunus = require(`taunus`);

function updateView () {
  if (global.CodePenEmbed && global.CodePenEmbed._showCodePenEmbeds) {
    global.CodePenEmbed._showCodePenEmbeds();
  }
}

function codepen () {
  taunus.on(`start`, updateView);
  taunus.on(`render`, updateView);
}

module.exports = codepen;
