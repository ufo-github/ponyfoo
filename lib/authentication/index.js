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

function routing (app, register) {
  transports.routing(app, register);
}

module.exports = {
  initialize: initialize,
  routing: routing
};
