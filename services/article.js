'use strict';

var contra = require('contra');
var estimate = require('estimate');
var env = require('../lib/env');
var Article = require('../models/Article');
var commentService = require('./comment');
var datetimeService = require('./datetime');

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

  commentService.hydrate(article, source);

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
  if (o.summary !== true) {
    delete article.summaryHtml;
  }
  if (o.meta) {
    delete article.teaserHtml;
    delete article.introductionHtml;
    delete article.bodyHtml;
  }
  delete article.__v;
  delete article.sign;
  delete article.teaser;
  delete article.introduction;
  delete article.body;
  delete article.titleMarkdown;
  delete article.summary;
  delete article.summaryText;
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
  return { slug: article.slug, titleHtml: article.titleHtml };
}

module.exports = {
  find: find,
  findOne: findOne,
  toJSON: toJSON
};
