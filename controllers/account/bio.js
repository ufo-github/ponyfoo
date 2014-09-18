'use strict';

module.exports = function (req, res, next) {
  res.viewModel = {
    model: {
      title: 'Bio Editor',
      meta: {
        canonical: '/account/bio'
      }
    }
  };
  next();
};
