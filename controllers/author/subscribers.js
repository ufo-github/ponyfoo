'use strict';

var Subscriber = require('../../models/Subscriber');

module.exports = function (req, res, next) {
  Subscriber.find({}).sort('created').select('-_id source created verified').lean().exec(render);

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
