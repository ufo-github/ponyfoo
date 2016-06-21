'use strict';

var taunus = require('taunus');
var store = {};

boot();

function boot () {
  taunus.on('start', updateStore);
  taunus.on('render', updateStore);
}

function updateStore (container, viewModel) {
  store.user = viewModel.user;
  store.roles = viewModel.roles;
}

function getUser () {
  return store.user || null;
}

function getRoles () {
  return store.roles || {};
}

function hasRole (user, roles) {
  var userRoles = Object.keys(user.roles);
  return userRoles.some(isSeekedRole);
  function isSeekedRole (role) {
    return userRoles[role] === true && roles.indexOf(role) !== -1;
  }
}

module.exports = {
  getUser: getUser,
  getRoles: getRoles,
  hasRole: hasRole
};
