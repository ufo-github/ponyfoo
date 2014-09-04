'use strict';

var _ = require('lodash');
var util = require('util');
var contra = require('contra');
var estimate = require('estimate');
var env = require('../lib/env');
var Article = require('../models/Article');
var Subscriber = require('../models/Subscriber');
var cryptoService = require('./crypto');
var emailService = require('./email');
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
  contra.concurrent({
    subscribers: findSubscribers,
    html: absolutizeHtml
  }, send);

  function findSubscribers (next) {
    Subscriber.find({ verified: true }, next);
  }

  function absolutizeHtml (next) {
    htmlService.absolutize(article.introductionHtml, next);
  }

  function send (err, data) {
    if (err) {
      done(err); return;
    }
    var model = {
      to: _.pluck(data.subscribers, 'email'),
      subject: article.title,
      intro: 'Hot off the press article on Pony Foo!',
      article: {
        title: article.title,
        permalink: '/' + article.slug,
        tags: article.tags,
        introductionHtml: data.html
      },
      mandrill: {
        locals: data.subscribers.map(subscriberLocals)
      }
    };
    emailService.send('article-published', model, emailService.logger);
    done();
  }
}

function subscriberLocals (subscriber) {
  var hash = subscriber._id.toString() + cryptoService.md5(subscriber.email);
  return {
    email: subscriber.email,
    model: {
      unsubscribe: util.format('%s/api/subscribers/%s/unsubscribe', authority, hash)
    }
  };
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
  var tag = article.tags[0].replace(/-/g, '');
  var links = util.format('%s/%s #%s', authority, article.slug, tag);
  var status = util.format(fmt, article.title, links);
  twitterService.tweet(status, done);
  done();
}

function toJSON (source) {
  var text = [source.introductionHtml, source.bodyHtml].join(' ');
  var article = source.toJSON();

  article.readingTime = estimate.text(text);
  article.permalink = '/' + article.slug;

  // TODO arrange comments in reasonable model view org.

  return article;
}

module.exports = {
  find: find,
  campaign: campaign,
  toJSON: toJSON
};
