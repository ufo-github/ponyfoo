'use strict';

module.exports = function impersonatorSwap (req, res, next) {
  req.ignoreImpersonation = true;
  next(null);
};
