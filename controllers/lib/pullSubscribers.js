'use strict';

var Subscriber = require('../../models/Subscriber');

module.exports = function pullSubscribers (req, res, done) {
  Subscriber
    .find({})
    .sort('created')
    .select('-_id source created verified')
    .lean()
    .exec(done);
};
