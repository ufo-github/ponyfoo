'use strict';

var _ = require('lodash');
var util = require('util');
var contra = require('contra');
var estimate = require('estimate');
var env = require('../lib/env');
var Article = require('../models/Article');
var Subscriber = require('../models/Subscriber');
var cryptoService = require('./crypto');
var subscriberService = require('./subscriber');
var twitterService = require('./twitter');
var htmlService = require('./html');
var authority = env('AUTHORITY');

function noop () {}

function find (query, options, done) {
  if (done === void 0) {
    done = options; options = {};
  }
  if (!options.populate) { options.populate = 'prev next related comments'; }
  if (!options.sort) { options.sort = '-publication'; }

  var cursor = Article.find(query);

  if (options.populate) {
    cursor = cursor.populate(options.populate);
  }
  if (options.sort) {
    cursor = cursor.sort(options.sort);
  }
  cursor.exec(done);
}

function campaign (article, done) {
  contra.concurrent([
    contra.curry(email, article),
    contra.curry(tweet, article)
  ], done);
}

function email (article, done) {
  if (done === void 0) {
    done = noop;
  }
  htmlService.absolutize(article.introductionHtml, send);

  function send (err, data) {
    if (err) {
      done(err); return;
    }
    var model = {
      subject: article.title,
      intro: 'Hot off the press article on Pony Foo!',
      article: {
        title: article.title,
        permalink: '/articles/' + article.slug,
        tags: article.tags,
        introductionHtml: data.html
      }
    };
    subscriberService.broadcast('article-published', model);
    done();
  }
}

function tweet (article, done) {
  var formats = [
    'Published: "%s" %s',
    'Fresh content!  "%s" %s',
    '"%s" contains crisp new words! %s',
    '"%s" is hot off the press! %s',
    'Extra! Extra! "%s" has just come out! %s',
    '"%s" has just been published! %s',
    'This just out! "%s" %s'
  ];
  var fmt = _.sample(formats);
  var tag = article.tags.slice(0, 2).join(' #').replace(/-/g, '');
  var links = util.format('%s/articles/%s #%s', authority, article.slug, tag);
  var status = util.format(fmt, article.title, links);
  twitterService.tweet(status, done);
  done();
}

function toJSON (source) {
  var text = [source.introductionHtml, source.bodyHtml].join(' ');
  var article = source.toJSON();

  article.readingTime = estimate.text(text);
  article.permalink = '/articles/' + article.slug;

  article.commentThreads = article.comments.sort(byPublication).reduce(threads, []);

  return article;
}

function threads (accumulator, comment) {
  var thread;
  if (comment.parent) {
    thread = _.find(accumulator, { id: comment.parent });
    thread.comments.push(comment);
  } else {
    thread = { id: comment._id, comments: [comment] };
    accumulator.push(thread);
  }
  return accumulator;
}

function byPublication (a, b) {
  return a.created - b.created;
}

module.exports = {
  find: find,
  campaign: campaign,
  toJSON: toJSON
};
