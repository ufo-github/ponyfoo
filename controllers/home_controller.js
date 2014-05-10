'use strict';

module.exports = {
  index: function (req, res, next) {
    res.viewModel = {
      partial: 'home/index'
    };
    next();
  }
};
