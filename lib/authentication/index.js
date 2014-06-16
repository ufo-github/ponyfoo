'use strict';

var transports = require('transports');
var User = require('../../models/User');
var data = require('./data');
var local = require('./local');
var providerHandler = require('./providerHandler');

function initialize () {
  transports.serialization(User);
  transports.passports(data, providerHandler);

  local();
}

function routing (app, register) {
  transports.routing(data, app, register);
}

module.exports = {
  initialize: initialize,
  routing: routing
};
