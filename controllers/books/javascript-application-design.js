'use strict';

module.exports = function (req, res, next) {
  res.viewModel = {
    model: {
      title: 'JavaScript Application Design (2015) \u2014 Pony Foo'
    }
  };
  next();
};
