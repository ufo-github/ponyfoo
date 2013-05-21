'use strict';

var async = require('async'),
    tweeter = require('./tweeterService.js');

module.exports = {
    publish: function(payload, done){
        async.parallel({
            tweet: async.apply(tweeter.tweet, payload)
        }, done);
    }
};