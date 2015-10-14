'use strict';

var contra = require('contra');
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
      next(user && user.author ? null : 'route');
    }
  ], function (err) {
    next(err);
  });
};
