'use strict';

var $ = require('dominus');
var taunus = require('taunus/global');
var loadScript = require('./loadScript');

function updateView (elem) {
  if ($('.ls-codepen').length === 0) {
    $(loadScript('//assets.codepen.io/assets/embed/ei.js')).addClass('ls-codepen');
  }
  if (global.CodePenEmbed && global.CodePenEmbed._showCodePenEmbeds) {
    global.CodePenEmbed._showCodePenEmbeds();
  }
}

taunus.on('render', updateView);

module.exports = {
  updateView: updateView
};
