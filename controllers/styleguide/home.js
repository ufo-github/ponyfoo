'use strict';

const colorService = require(`../../services/color`);

module.exports = function (req, res, next) {
  res.viewModel = {
    model: {
      title: `Style Guide \u2014 Pony Foo`,
      colors: colorService.colorSections
    }
  };
  next();
};
