'use strict'

const Twit = require(`twit`)
const winston = require(`winston`)
const env = require(`../lib/env`)
const enabled = env(`TWITTER_PUBLISHING`)
const client = create()

function create () {
  return enabled && new Twit({
    consumer_key:        env(`SELF_TWITTER_CONSUMER_KEY`),
    consumer_secret:     env(`SELF_TWITTER_CONSUMER_SECRET`),
    access_token:        env(`SELF_TWITTER_ACCESS_TOKEN_KEY`),
    access_token_secret: env(`SELF_TWITTER_ACCESS_TOKEN_SECRET`),
  })
}

function noop () {}

function tweet (status, done) {
  client.post(`statuses/update`, { status: status }, done || noop)
}

function fake (status, done) {
  winston.info(`Tweet: ` + status);
  (done || noop)()
}

module.exports = {
  tweet: enabled ? tweet : fake
}
