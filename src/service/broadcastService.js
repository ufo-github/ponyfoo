'use strict';

var async = require('async'),
    tweeter = require('./tweeterService.js'),
    subscription = require('./subscriptionService.js');

module.exports = {
    publish: function(payload, done){
        async.parallel({
            tweet: async.apply(tweeter.tweet, payload),
            email: async.apply(subscription.notifySubscribers, payload)
        }, done);
    }
};