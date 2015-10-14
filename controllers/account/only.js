'use strict';

module.exports = function (req, res, next) {
  next(req.user ? null : 'route');
};
