'use strict';

var _ = require('lodash');
var but = require('but');
var util = require('util');
var contra = require('contra');
var estimate = require('estimate');
var env = require('../lib/env');
var Article = require('../models/Article');
var commentService = require('./comment');
var subscriberService = require('./subscriber');
var textService = require('./text');
var datetimeService = require('./datetime');
var facebookService = require('./facebook');
var twitterService = require('./twitter');
var twitterEmojiService = require('./twitterEmoji');
var echojsService = require('./echojs');
var hackernewsService = require('./hackernews');
var lobstersService = require('./lobsters');
var markupService = require('./markup');
var authority = env('AUTHORITY');

function noop () {}

function findInternal (method, query, options, done) {
  if (done === void 0) {
    done = options; options = {};
  }
  if (!options.sort) { options.sort = '-publication'; }

  var cursor = Article[method](query);

  if (options.populate) {
    cursor = cursor.populate(options.populate);
  }
  if (options.sort) {
    cursor = cursor.sort(options.sort);
  }
  if (options.skip) {
    cursor = cursor.skip(options.skip);
  }
  if (options.limit) {
    cursor = cursor.limit(options.limit);
  }
  cursor.exec(done);
}

var find = findInternal.bind(null, 'find');
var findOne = findInternal.bind(null, 'findOne');

function campaign (article, done) {
  if (done === void 0) {
    done = noop;
  }
  contra.concurrent([
    curried('email', email),
    curried('tweet', tweet),
    curried('fb', fbShare),
    curried('echojs', echojs),
    curried('hn', hackernews),
    curried('lobsters', lobsters)
  ], done);

  function curried (key, fn) {
    return function sharing (next) {
      if (article[key] === false) {
        next(); return;
      }
      fn(article, {}, next);
    };
  }
}

function email (article, options, done) {
  var relativePermalink = '/articles/' + article.slug;
  var intro = article.teaserHtml + article.introductionHtml;
  var teaser = markupService.compile(intro, { markdown: false, absolutize: true });
  var model = {
    subject: article.title,
    teaser: options.reshare ? 'You can\'t miss this!' : 'Hot off the press!',
    article: {
      title: article.title,
      permalink: relativePermalink,
      tags: article.tags,
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
  subscriberService.broadcast('article-published', model, done);
}

function socialStatus (article, options) {
  var fresh = [
    'Just %spublished: "%s"',
    'Fresh %scontent on Pony Foo! "%s"',
    '%s"%s" contains crisp new words!',
    '%s"%s" is hot off the press!',
    'Extra! Extra! %s"%s" has just come out!',
    '%s"%s" has just been published!',
    'This just %sout! "%s"'
  ];
  var manual = [
    '%sCheck out "%s" on Pony Foo!',
    'ICYMI %s%s',
    'Have you read %s"%s" yet?'
  ];
  var formats = options.reshare ? manual : fresh;
  var fmt = _.sample(formats);
  var emoji = options.emoji === false ? '' : twitterEmojiService.generate(['people']) + ' ';
  var status = util.format(fmt, emoji, article.title);
  return status;
}

function statusLink (article) {
  return util.format('%s/articles/%s', authority, article.slug);
}

function tweet (article, options, done) {
  var tag = '#' + article.tags.slice(0, 2).join(' #');
  var camelTag = textService.hyphenToCamel(tag);
  var status = util.format('%s %s %s', socialStatus(article, options), statusLink(article), camelTag);
  twitterService.tweet(status, done);
}

function fbShare (article, options, done) {
  options.emoji = false;
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

function lobsters (article, options, done) {
  var data = {
    title: article.title,
    url: util.format('%s/articles/%s', authority, article.slug)
  };
  lobstersService.submit(data, done);
}

function toJSON (source, options) {
  var o = options || {};
  var text = [source.teaserHtml, source.introductionHtml, source.bodyHtml].join(' ');
  var article = source.toJSON();

  article.permalink = '/articles/' + article.slug;
  article.publication = datetimeService.field(article.publication);
  article.readingTime = estimate.text(text);

  if (source.populated('author')) {
    article.author = article.author.toString();
  } else {
    delete article.author;
  }

  if (source.populated('comments')) {
    article.commentThreads = article.comments.sort(byPublication).reduce(threads, []);
  }
  article.commentCount = article.comments.length;

  if (source.populated('prev')) {
    article.prev = relevant(article.prev);
  } else {
    delete article.prev;
  }
  if (source.populated('next')) {
    article.next = relevant(article.next);
  } else {
    delete article.next;
  }
  if (source.populated('related')) {
    article.related = article.related.map(relevant);
  } else {
    delete article.related;
  }

  if (o.id === false) {
    delete article._id;
  }
  if (o.meta) {
    delete article.teaser;
    delete article.teaserHtml;
    delete article.introduction;
    delete article.introductionHtml;
    delete article.body;
    delete article.bodyHtml;
  }
  delete article.__v;
  delete article.sign;
  delete article.teaser;
  delete article.introduction;
  delete article.body;
  delete article.comments;
  delete article.hn;
  delete article.lobsters;
  delete article.echojs;
  delete article.tweet;
  delete article.fb;
  delete article.email;
  return article;
}

function relevant (article) {
  return { slug: article.slug, title: article.title };
}

function threads (accumulator, comment) {
  var thread;
  var commentModel = commentService.toJSON(comment);
  if (commentModel.parent) {
    thread = _.find(accumulator, { id: commentModel.parent.toString() });
    thread.comments.push(commentModel);
  } else {
    thread = { id: commentModel._id.toString(), comments: [commentModel] };
    accumulator.push(thread);
  }
  return accumulator;
}

function byPublication (a, b) {
  return a.created - b.created;
}

campaign.email = email;
campaign.twitter = tweet;
campaign.facebook = fbShare;
campaign.echojs = echojs;
campaign.hackernews = hackernews;
campaign.lobsters = lobsters;

module.exports = {
  find: find,
  findOne: findOne,
  campaign: campaign,
  toJSON: toJSON
};
