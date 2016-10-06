'use strict';

const fs = require(`fs`);
const contra = require(`contra`);
const assign = require(`assignment`);
const Twit = require(`twit`);
const winston = require(`winston`);
const unlockCodeService = require(`./unlockCode`);
const env = require(`../lib/env`);
const enabled = env(`USER_TWEETS`);
const submit = enabled ? postTweet : logTweet;
const tweets = {
  '/books/practical-es6': {
    media: `./client/img/mjavascript/cover-with-text.png`,
    mediaAlt: `The Modular JavaScript book series glowing over the desktop of an eager learner.`,
    status: [
      `📢 Check out @mjavascript!`,
      `📚 5 books on #ModularJavaScript`,
      `👏 ES6, module thinking, modular design, testing, deploys`,
      `💳 https://mjavascript.com`
    ].join(`\n`)
  }
};

function create ({ twitterToken, twitterTokenSecret }) {
  return enabled && new Twit({
    consumer_key: env(`USER_TWITTER_CONSUMER_KEY`),
    consumer_secret: env(`USER_TWITTER_CONSUMER_SECRET`),
    access_token: twitterToken,
    access_token_secret: twitterTokenSecret,
  });
}

function postTweet ({ tweet, twitterToken, twitterTokenSecret }) {
  const client = create({ twitterToken, twitterTokenSecret });

  if (tweet.media) {
    contra.waterfall([
      readMedia,
      uploadMedia,
      postMetadata,
      postStatus
    ], log);
    return;
  }

  postStatus({}, log);

  function readMedia (next) {
    fs.readFile(tweet.media, { encoding: `base64` }, next);
  }

  function uploadMedia (media_data, next) {
    client.post(`media/upload`, { media_data }, next);
  }

  function postMetadata (data, response, next) {
    const media_id = data.media_id_string;
    const media_ids = [media_id];
    const alt_text = { text: tweet.mediaAlt };
    const meta = { media_id, alt_text };
    const forwarder = err => next(err, { media_ids });
    client.post(`media/metadata/create`, meta, forwarder);
  }

  function postStatus (options, next) {
    const { status } = tweet;
    const payload = assign({ status }, options);
    client.post(`statuses/update`, payload, next);
  }
}

function logTweet ({ tweet }) {
  winston.info(`Tweet: ` + tweet.status);
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
  const tweet = tweets[code];
  if (tweet) {
    submit({ tweet, twitterToken, twitterTokenSecret });
  }
}

module.exports = {
  setup
};
