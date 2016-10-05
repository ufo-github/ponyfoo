'use strict';

const Twit = require(`twit`);
const winston = require(`winston`);
const unlockCodeService = require(`./unlockCode`);
const env = require(`../lib/env`);
const enabled = env(`USER_TWEETS`);
const submit = enabled ? tweet : fake;
const statuses = {
  '/books/practical-es6': [
    `a bcd`,
    `e fgh`,
    `i jkl`
  ].join(`\n`)
};

function create ({ twitterToken, twitterTokenSecret }) {
  return enabled && new Twit({
    consumer_key: env(`USER_TWITTER_CONSUMER_KEY`),
    consumer_secret: env(`USER_TWITTER_CONSUMER_SECRET`),
    access_token: twitterToken,
    access_token_secret: twitterTokenSecret,
  });
}

function tweet ({ status, twitterToken, twitterTokenSecret }) {
  const client = create({ twitterToken, twitterTokenSecret });
  const payload = { status };
  client.post(`statuses/update`, payload, log);
}

function fake ({ status }) {
  winston.info(`Tweet: ` + status);
}

function log (err) {
  if (err) {
    winston.warn(`Error while tweeting.`, err);
  }
}

function setup () {
  unlockCodeService.on(`added`, added);
}

function added ({ user, code }) {
  const { twitterToken, twitterTokenSecret } = user;
  const status = statuses[code];
  if (status) {
    submit({ status, twitterToken, twitterTokenSecret });
  }
}

module.exports = {
  setup
};
