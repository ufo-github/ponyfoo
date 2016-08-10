'use strict';

const fs = require('fs');
const but = require('but');
const util = require('util');
const env = require('../lib/env');
const subscriberService = require('./subscriber');
const cryptoService = require('./crypto');
const facebookService = require('./facebook');
const twitterService = require('./twitter');
const emojiService = require('./emoji');
const echojsService = require('./echojs');
const hackernewsService = require('./hackernews');
const weeklyService = require('./weekly');
const User = require('../models/User');
const authority = env('AUTHORITY');
const card = env('TWITTER_CAMPAIGN_CARD_NEWSLETTER');
const css = fs.readFileSync('.bin/static/newsletter-email.css', 'utf8');

function emailSelf (issue, options, done) {
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
    email(issue, options, done);
  }
}

function email (issue, options, done) {
  if (options.reshare) {
    done(new Error('The weekly newsletter cannot be reshared.')); return;
  }
  const thanks = options.thanks ? ('?thanks=' + cryptoService.md5(issue._id + options.thanks)) : '';
  const relativePermalink = '/weekly/' + issue.slug + thanks;
  const permalink = authority + relativePermalink;
  const issueModel = weeklyService.toView(issue);
  const model = {
    subject: issue.computedPageTitle,
    teaser: 'This week’s Web Platform news & inspiration',
    teaserRightHtml: util.format('<a href="%s">Read this issue on ponyfoo.com</a>', permalink),
    headerImage: false,
    css: css,
    permalink: permalink,
    thanks: !!thanks,
    issue: issueModel,
    emailFormat: true,
    linkedData: {
      '@context': 'http://schema.org',
      '@type': 'EmailMessage',
      potentialAction: {
        '@type': 'ViewAction',
        name: 'See web version',
        target:  permalink
      },
      description: 'See weekly newsletter issue #' + issue.slug + ' on the web'
    }
  };
  subscriberService.send({
    topic: 'newsletter',
    template: 'newsletter-issue',
    patrons: options.patrons,
    recipients: options.recipients,
    model: model
  }, done);
}

function statusLink (issue) {
  return util.format('%s/weekly/%s', authority, issue.slug);
}

function tweet (issue, options, done) {
  let tweetLength = 0;
  const tweetLines = [];
  const title = issue.computedTitle;
  const emoji = emojiService.randomFun();
  const mail1 = emojiService.randomMailEmoji();
  const mail2 = emojiService.randomMailEmoji();

  add(3, mail1 + ' ' + statusLink(issue), 2 + 24);
  add(0, emoji + ' ' + title, 2 + title.length);
  add(4, card, 25);
  add(1, '🏷 #ponyfooweekly', 16); // no extra new line here
  add(2, mail2 + ' ' + 'Read, comment & subscribe ⤵️', 2 + 28);

  const status = tweetLines.filter(notEmpty).join('\n');

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

function facebook (issue, options, done) {
  facebookService.share(issue.computedTitle, statusLink(issue), done);
}

function echojs (issue, options, done) {
  const data = {
    title: issue.computedTitle,
    url: util.format('%s/weekly/%s', authority, issue.slug)
  };
  echojsService.submit(data, done);
}

function hackernews (issue, options, done) {
  const data = {
    title: issue.computedTitle,
    url: util.format('%s/weekly/%s', authority, issue.slug)
  };
  hackernewsService.submit(data, submitted);
  function submitted (err, res, body, discuss) {
    issue.hnDiscuss = discuss;
    issue.save(but(done));
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
