'use strict';

var contra = require('contra');
var Article = require('../models/Article');
var Subscriber = require('../models/Subscriber');
var emailService = require('./email');
var htmlService = require('./html');

function noop () {}

function find (query, options, done) {
  if (done === void 0) {
    done = options; options = {};
  }
  if (!options.populate) { options.populate = 'prev next related'; }
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
    Subscriber.find({}, next);
  }

  function absolutizeHtml (next) {
    htmlService.absolutize(article.introductionHtml, next);
  }

  function send (err, data) {
    if (err) {
      done(err); return;
    }
    var model = {
      to: data.subscribers,
      subject: article.title,
      intro: 'Hot off the press article on Pony Foo!',
      article: {
        title: article.title,
        permalink: article.permalink,
        tags: article.tags,
        introductionHtml: data.html
      }
    };
    emailService.send('verify-address', model, emailService.logger);
    done();
  }
}

function tweet (article, done) {
  console.log('TODO: tweet about article');
  done();
}

module.exports = {
  find: find,
  campaign: campaign
};
