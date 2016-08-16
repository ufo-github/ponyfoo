'use strict';

const _ = require(`lodash`);
const but = require(`but`);
const util = require(`util`);
const env = require(`../lib/env`);
const subscriberService = require(`./subscriber`);
const textService = require(`./text`);
const facebookService = require(`./facebook`);
const twitterService = require(`./twitter`);
const emojiService = require(`./emoji`);
const echojsService = require(`./echojs`);
const hackernewsService = require(`./hackernews`);
const markupService = require(`./markup`);
const User = require(`../models/User`);
const authority = env(`AUTHORITY`);
const card = env(`TWITTER_CAMPAIGN_CARD_ARTICLES`);

function emailSelf (article, options, done) {
  if (!options.userId) {
    done(new Error(`User not provided.`)); return;
  }
  User.findOne({ _id: options.userId }).select(`email`).exec(found);
  function found (err, user) {
    if (err) {
      done(err); return;
    }
    if (!user) {
      done(new Error(`User not found.`)); return;
    }
    options.recipients = [user.email];
    email(article, options, done);
  }
}

function email (article, options, done) {
  const relativePermalink = `/articles/` + article.slug;
  const intro = article.teaserHtml + article.introductionHtml;
  const teaser = markupService.compile(intro, { markdown: false, absolutize: true });
  const model = {
    subject: article.title,
    teaser: options.reshare ? `You can’t miss this!` : `Hot off the press!`,
    article: {
      titleHtml: article.titleHtml,
      permalink: relativePermalink,
      tags: article.tags,
      author: {
        displayName: article.author.displayName,
        slug: article.author.slug
      },
      teaserHtml: teaser
    },
    linkedData: {
      '@context': `http://schema.org`,
      '@type': `EmailMessage`,
      potentialAction: {
        '@type': `ViewAction`,
        name: `See article`,
        target:  authority + relativePermalink
      },
      description: `See article – ` + article.title
    }
  };
  subscriberService.send({
    topic: `articles`,
    template: `article-published`,
    model: model,
    recipients: options.recipients
  }, done);
}

function socialStatus (article, options) {
  const fresh = [
    `Just published: "%s"`,
    `Fresh content on Pony Foo! "%s"`,
    `"%s" contains crisp new words!`,
    `"%s" is hot off the press!`,
    `Extra! Extra! "%s" has just come out!`,
    `"%s" has just been published!`,
    `This just out! "%s"`
  ];
  const manual = [
    `Check out "%s" on Pony Foo!`,
    `ICYMI %s`,
    `Have you read "%s" yet?`
  ];
  const formats = options.reshare ? manual : fresh;
  const fmt = _.sample(formats);
  const status = util.format(fmt, article.title);
  return status;
}

function statusLink (article) {
  return util.format(`%s/articles/%s`, authority, article.slug);
}

function socialPrefix (options) {
  return _.sample(options.reshare ? [
    `In case you missed it!`,
    `Read this!`,
    `Check this out!`
  ] : [
    `Just published!`,
    `Fresh content!`,
    `Crisp new words!`,
    `Hot off the press!`,
    `Extra! Extra!`,
    `This just out!`
  ]);
}

function tweet (article, options, done) {
  const tagPair = `#` + article.tags.slice(0, 2).join(` #`);
  const tagText = textService.hyphenToCamel(tagPair);
  const emoji = emojiService.randomFun();
  const prefix = socialPrefix(options);
  const tweetLines = [];
  let tweetLength = 0;

  add(4, `➡️️ ` + statusLink(article), 2 + 24);
  add(1, emoji + ` ` + article.title, 2 + article.title.length);
  add(5, card, 25);
  add(0, `📰 ` + prefix, 2 + prefix.length);

  if (article.author.twitter) {
    add(2, `✍ By @` + article.author.twitter, 6 + article.author.twitter.length);
  }

  add(3, `🏷 ` + tagText, 2 + tagText.length - 1); // no extra new line here

  const status = tweetLines.filter(notEmpty).join(`\n`);

  twitterService.tweet(status, done);

  function add (i, contents, length) {
    if (tweetLength + length + 1 > 140) {
      return; // avoid going overboard
    }
    tweetLength += length + 1; // one for the next new line
    tweetLines[i] = contents;
  }
  function notEmpty (line) {
    return line;
  }
}

function facebook (article, options, done) {
  facebookService.share(socialStatus(article, options), statusLink(article), done);
}

function echojs (article, options, done) {
  const data = {
    title: article.title,
    url: util.format(`%s/articles/%s`, authority, article.slug)
  };
  echojsService.submit(data, done);
}

function hackernews (article, options, done) {
  const data = {
    title: article.title,
    url: util.format(`%s/articles/%s`, authority, article.slug)
  };
  hackernewsService.submit(data, submitted);
  function submitted (err, res, body, discuss) {
    if (err) {
      done(err); return;
    }
    article.hnDiscuss = discuss;
    article.save(but(done));
  }
}

module.exports = {
  'email-self': emailSelf,
  email: email,
  twitter: tweet,
  facebook: facebook,
  echojs: echojs,
  hackernews: hackernews
};
