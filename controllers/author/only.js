'use strict';

var contra = require('contra');
var errors = require('../../lib/errors');
var User = require('../../models/User');

module.exports = function (req, res, next) {
  contra.waterfall([
    function (next) {
      next(req.user ? null : new errors.NotFoundError());
    },
    function (next) {
      User.findOne({ _id: req.user }, next);
    },
    function (user, next) {
      next(user && user.author ? null : new errors.NotFoundError());
    }
  ], function (err) {
    next(err);
  });
};
