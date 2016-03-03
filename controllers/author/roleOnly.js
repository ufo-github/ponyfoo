'use strict';

var contra = require('contra');
var winston = require('winston');
var User = require('../../models/User');

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
        var ok = user && roles.some(userHasRole);
        if (!ok) {
          winston.warn('Unauthorized request for "%s" resource: %s', roles, req.url);
        }
        next(ok ? null : 'route');
        function userHasRole (role) {
          return user.roles.indexOf(role) !== -1;
        }
      }
    ], function (err) {
      next(err);
    });
  };
};
