'use strict';

var Twit = require('twit');
var winston = require('winston');
var env = require('../lib/env');
var enabled = env('TWITTER_PUBLISHING');
var client = create();

function create () {
  return enabled && new Twit({
    consumer_key:        env('TWITTER_CONSUMER_KEY'),
    consumer_secret:     env('TWITTER_CONSUMER_SECRET'),
    access_token:        env('TWITTER_ACCESS_TOKEN_KEY'),
    access_token_secret: env('TWITTER_ACCESS_TOKEN_SECRET'),
  });
}

function noop () {}

function tweet (status, done) {
  client.post('statuses/update', { status: status }, done || noop);
}

function fake (status, done) {
  winston.info('Tweet: ' + status);
  (done || noop)();
}

module.exports = {
  tweet: enabled ? tweet : fake
};
