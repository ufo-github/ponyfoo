'use strict';

var errors = require('../../lib/errors');

module.exports = function (req, res, next) {
  var err;
  if (!req.user) {
    err = new errors.NotFoundError();
  }
  next(err);
};
