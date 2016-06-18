'use strict';

module.exports = function (req, res, next) {
  res.viewModel = {
    model: {
      title: 'Privacy Policy \u2014 Pony Foo',
      meta: {
        canonical: '/privacy'
      }
    }
  };
  next();
}
