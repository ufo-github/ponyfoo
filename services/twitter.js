'use strict';

var Twit = require('twit');
var env = require('../lib/env');
var client = new Twit({
  consumer_key:        env('TWITTER_CONSUMER_KEY'),
  consumer_secret:     env('TWITTER_CONSUMER_SECRET'),
  access_token:        env('TWITTER_ACCESS_TOKEN_KEY'),
  access_token_secret: env('TWITTER_ACCESS_TOKEN_SECRET'),
});

function noop () {}

function tweet (status, done) {
  client.post('statuses/update', { status: status }, done || noop);
}

module.exports = {
  tweet: tweet
};
