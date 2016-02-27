'use strict';

var pullData = require('../lib/pullData');

module.exports = function (req, res, next) {
  pullData(function render (err, result) {
    if (err) {
      next(err); return;
    }

    res.viewModel = {
      model: {
        title: 'Subscribe to Pony Foo!',
        subscriberGraph: result
      }
    };
    next();
  });
};
