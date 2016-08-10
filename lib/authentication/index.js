'use strict';

const transports = require('transports');
const data = require('./data');
const local = require('./local');
const providerHandler = require('./providerHandler');

function initialize () {
  transports.configure(data);
  transports.serialization();
  transports.passports(providerHandler);

  local();
}

module.exports = {
  initialize: initialize
};
