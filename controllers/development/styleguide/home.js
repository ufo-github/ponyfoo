'use strict';

var colorService = require('../../../services/color');

module.exports = function (req, res, next) {
  res.ignoreNotFound = true;
  res.viewModel = {
    leanLayout: true,
    model: {
      title: 'Style Guide \u2014 Pony Foo',
      action: '../server/styleguide/home',
      colors: colorService.colorSections
    }
  };
  next();
};
