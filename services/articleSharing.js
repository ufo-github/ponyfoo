'use strict';

var _ = require('lodash');
var but = require('but');
var util = require('util');
var env = require('../lib/env');
var subscriberService = require('./subscriber');
var textService = require('./text');
var facebookService = require('./facebook');
var twitterService = require('./twitter');
var emojiService = require('./emoji');
var echojsService = require('./echojs');
var hackernewsService = require('./hackernews');
var markupService = require('./markup');
var User = require('../models/User');
var authority = env('AUTHORITY');
var card = env('TWITTER_CAMPAIGN_CARD_ARTICLES');

function emailSelf (article, options, done) {
  if (!options.userId) {
    done(new Error('User not provided.')); return;
  }
  User.findOne({ _id: options.userId }).select('email').exec(found);
  function found (err, user) {
    if (err) {
      done(err); return;
    }
    if (!user) {
      done(new Error('User not found.')); return;
    }
    options.recipients = [user.email];
    email(article, options, done);
  }
}

function email (article, options, done) {
  var relativePermalink = '/articles/' + article.slug;
  var intro = article.teaserHtml + article.introductionHtml;
  var teaser = markupService.compile(intro, { markdown: false, absolutize: true });
  var model = {
    subject: article.title,
    teaser: options.reshare ? 'You can’t miss this!' : 'Hot off the press!',
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
      '@context': 'http://schema.org',
      '@type': 'EmailMessage',
      potentialAction: {
        '@type': 'ViewAction',
        name: 'See article',
        target:  authority + relativePermalink
      },
      description: 'See article – ' + article.title
    }
  };
  subscriberService.send({
    topic: 'articles',
    template: 'article-published',
    model: model,
    recipients: options.recipients
  }, done);
}

function socialStatus (article, options) {
  var fresh = [
    'Just published: "%s"',
    'Fresh content on Pony Foo! "%s"',
    '"%s" contains crisp new words!',
    '"%s" is hot off the press!',
    'Extra! Extra! "%s" has just come out!',
    '"%s" has just been published!',
    'This just out! "%s"'
  ];
  var manual = [
    'Check out "%s" on Pony Foo!',
    'ICYMI %s',
    'Have you read "%s" yet?'
  ];
  var formats = options.reshare ? manual : fresh;
  var fmt = _.sample(formats);
  var status = util.format(fmt, article.title);
  return status;
}

function statusLink (article) {
  return util.format('%s/articles/%s', authority, article.slug);
}

function socialPrefix (options) {
  return _.sample(options.reshare ? [
    'In case you missed it!',
    'Read this!',
    'Check this out!'
  ] : [
    'Just published!',
    'Fresh content!',
    'Crisp new words!',
    'Hot off the press!',
    'Extra! Extra!',
    'This just out!'
  ]);
}

function tweet (article, options, done) {
  var tagPair = '#' + article.tags.slice(0, 2).join(' #');
  var tagText = textService.hyphenToCamel(tagPair);
  var emoji = emojiService.randomFun();
  var prefix = socialPrefix(options);
  var tweetLength = 0;
  var tweetLines = [];

  add(4, '➡️️ ' + statusLink(article), 2 + 24);
  add(1, emoji + ' ' + article.title, 2 + article.title.length);
  add(5, card, 25);
  add(0, '📰 ' + prefix, 2 + prefix.length);

  if (article.author.twitter) {
    add(2, '✍ By @' + article.author.twitter, 6 + article.author.twitter.length);
  }

  add(3, '🏷 ' + tagText, 2 + tagText.length - 1); // no extra new line here

  var status = tweetLines.filter(notEmpty).join('\n');

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
  var data = {
    title: article.title,
    url: util.format('%s/articles/%s', authority, article.slug)
  };
  echojsService.submit(data, done);
}

function hackernews (article, options, done) {
  var data = {
    title: article.title,
    url: util.format('%s/articles/%s', authority, article.slug)
  };
  hackernewsService.submit(data, submitted);
  function submitted (err, res, body, discuss) {
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
