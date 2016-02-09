'use strict';

var assign = require('assignment');
var pullData = require('../lib/pullData');

module.exports = function (req, res, next) {
  pullData(function render (err, result) {
    if (err) {
      next(err); return;
    }

    res.viewModel = {
      model: assign(result, {
        title: 'Subscribe to Pony Foo!'
      })
    };
    next();
  });
};
