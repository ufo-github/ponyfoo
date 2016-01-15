'use strict';

var twitterWidget = require('./vendor/twitter.widget');
var codepen = require('./vendor/codepen');
var ga = require('./vendor/ga');
var clicky = require('./vendor/clicky');

function analytics (env) {
  twitterWidget();
  codepen();
  ga();
  clicky();
}

module.exports = analytics;
