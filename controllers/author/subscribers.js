'use strict';

var _ = require('lodash');
var Subscriber = require('../../models/Subscriber');

module.exports = function (req, res, next) {
  Subscriber.find({ verified: true }).sort('created').select('-_id source created').lean().exec(render);

  function render (err, subscribers) {
    if (err) {
      next('route'); return;
    }

    res.viewModel = {
      model: {
        title: 'Subscribers',
        subscribers: subscribers
      }
    };
    next();
  }
};
