'use strict';

var notFound = '/not-found';
var inliningService = require('../../services/inlining');

module.exports = function (req, res, next) {
  if (res.ignoreNotFound) {
    next(); return;
  }
  res.status(404);
  res.viewModel = {
    model: {
      title: 'Not Found!',
      action: 'error/not-found',
      meta: {
        canonical: notFound
      }
    }
  };
  inliningService.addStyles(res.viewModel.model, 'errors');
  next();
};
