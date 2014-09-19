'use strict';

var transports = require('transports');
var data = require('./data');
var local = require('./local');
var providerHandler = require('./providerHandler');

function initialize () {
  transports.configure(data);
  transports.serialization();
  transports.passports(providerHandler);

  local();
}

module.exports = {
  initialize: initialize
};
