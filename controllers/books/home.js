'use strict';

module.exports = function (req, res, next) {
  res.viewModel = {
    model: {
      title: 'Books written by Nicolás Bevacqua \u2014 Pony Foo'
    }
  };
  next();
};
