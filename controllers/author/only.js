'use strict';

var contra = require('contra');
var winston = require('winston');
var User = require('../../models/User');

module.exports = function (req, res, next) {
  contra.waterfall([
    function (next) {
      next(req.user ? null : 'route');
    },
    function (next) {
      User.findOne({ _id: req.user }, next);
    },
    function (user, next) {
      var ok = user && user.author;
      if (!ok) {
        winston.warn('Unauthorized request to author HTTP resource.');
      }
      next(ok ? null : 'route');
    }
  ], function (err) {
    next(err);
  });
};
