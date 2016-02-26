'use strict';

module.exports = function (req, res, next) {
  res.viewModel = {
    model: {
      title: 'Email Composer \u2014 Pony Foo',
      meta: {
        canonical: '/author/email'
      }
    }
  };
  next();
};
