'use strict';

const twitterWidget = require(`./vendor/twitter.widget`);
const codepen = require(`./vendor/codepen`);
const ga = require(`./vendor/ga`);
const clicky = require(`./vendor/clicky`);

function analytics () {
  twitterWidget();
  codepen();
  ga();
  clicky();
}

module.exports = analytics;
