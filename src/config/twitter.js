'use strict';

var env = require('./env.js');

module.exports = {
    broadcast: env.ENABLE_TWITTER_BROADCAST,
    consumerKey: env.TWITTER_CONSUMER_KEY,
    consumerSecret: env.TWITTER_CONSUMER_SECRET,
    accessTokenKey: env.TWITTER_ACCESS_TOKEN_KEY,
    accessTokenSecret: env.TWITTER_ACCESS_TOKEN_SECRET
};