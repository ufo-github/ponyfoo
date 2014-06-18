'use strict';

var transports = require('transports');
var User = require('../../models/User');
var data = require('./data');
var local = require('./local');
var providerHandler = require('./providerHandler');

function initialize () {
  transports.configure(data);
  transports.serialization(User);
  transports.passports(providerHandler);

  local();
}

module.exports = {
  initialize: initialize
};
