'use strict';

var customs = require('customs-passport');
var User = require('../../models/User');
var data = require('./data');
var local = require('./local');

function initialize () {p
  customs.serialization(User);
  customs.passports(data, providerHandler);

  local();
}

function routing (app, register) {
  customs.routing(data, app, register);
}

module.exports = {
  initialize: initialize,
  routing: routing
};
