'use strict';

var errors = require('../lib/errors');

module.exports = {
  only: function (req, res, next) {
    var err;
    if (req.author) { // TODO !
      err = new errors.NotFoundError();
    }
    next(err);
  },
  compose: function (req, res, next) {
    res.viewModel = {
      partial: 'author/compose',
      model: {
        title: 'Article Composer'
      }
    };
    next();
  }
};
