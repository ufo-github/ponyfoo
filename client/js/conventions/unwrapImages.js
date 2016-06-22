'use strict';

var $ = require('dominus');
var taunus = require('taunus');
var unwrapImages = require('../lib/unwrapImages');
var body = $.findOne('body');

function unwrap () {
  taunus.on('start', unwrapImages.bind(null, body));
  taunus.on('render', unwrapImages);
}

module.exports = unwrap;
