'use strict';

module.exports = function (req, res, next) {
  res.viewModel = {
    model: {
      title: 'New Open-Source Project \u2014 Pony Foo'
    }
  };
  next();
};
