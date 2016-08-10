'use strict';

const winston = require('winston');
const userService = require('../../services/user');

module.exports = function roleOnly (roles) {
  return function requestRoleTest (req, res, next) {
    const ok = req.userObject && userService.hasRole(req.userObject, roles);
    if (!ok) {
      winston.warn('Unauthorized request for "%s" resource: %s', roles, req.url);
      next('route');
      return;
    }
    next(null);
  };
};
