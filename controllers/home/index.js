'use strict';

module.exports = function (req, res, next) {
  res.viewModel = {};
  next();
};
