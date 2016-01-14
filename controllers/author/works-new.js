'use strict';

module.exports = function (req, res, next) {
  res.viewModel = {
    model: {
      title: 'New Open Source Work \u2014 Pony Foo'
    }
  };
  next();
};
