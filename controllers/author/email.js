'use strict';

module.exports = function (req, res, next) {
  res.viewModel = {
    model: {
      title: 'Email Composer',
      meta: {
        canonical: '/author/email'
      }
    }
  };
  next();
};
