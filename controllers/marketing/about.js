'use strict';

module.exports = function (req, res, next) {
  res.viewModel = {
    model: {
      title: 'Nicolás Bevacqua \u2014 Pony Foo'
    }
  };
  next();
}
