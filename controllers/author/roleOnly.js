'use strict';

var winston = require('winston');
var userService = require('../../services/user');

module.exports = function roleOnly (roles) {
  return function requestRoleTest (req, res, next) {
    var ok = req.userObject && userService.hasRole(req.userObject, roles);
    if (!ok) {
      winston.warn('Unauthorized request for "%s" resource: %s', roles, req.url);
      next('route');
      return;
    }
    next(null);
  };
};
