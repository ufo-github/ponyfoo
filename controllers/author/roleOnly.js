'use strict';

var contra = require('contra');
var winston = require('winston');
var User = require('../../models/User');
var userService = require('../../services/user');

module.exports = function roleOnly (roles) {
  return function requestRoleTest (req, res, next) {
    contra.waterfall([
      function userOrFail (next) {
        next(req.user ? null : 'route');
      },
      function findUser (next) {
        User.findOne({ _id: req.user }).select('roles').exec(next);
      },
      function testUser (user, next) {
        var ok = user && userService.hasRole(user, roles);
        if (!ok) {
          winston.warn('Unauthorized request for "%s" resource: %s', roles, req.url);
          next('route');
          return;
        }
        req.userObject = {
          roles: user.roles
        };
        next(null);
      }
    ], function (err) {
      next(err);
    });
  };
};
