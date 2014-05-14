'use strict';

module.exports = function (req, res, next) {
  res.viewModel = {
    model: {
      title: 'Article Composer'
    }
  };
  next();
};
