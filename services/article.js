'use strict';

var contra = require('contra');
var estimate = require('estimate');
var env = require('../lib/env');
var Article = require('../models/Article');
var commentService = require('./comment');
var datetimeService = require('./datetime');
var metadataService = require('./metadata');
var userService = require('./user');

function findInternal (method, query, options, done) {
  if (done === void 0) {
    done = options; options = {};
  }
  if (!options.sort) { options.sort = { publication: -1, updated: -1 }; }

  var cursor = Article[method](query);
  var populations = options.populate;
  var populationSteps;
  if (populations) {
    populationSteps = Array.isArray(populations) ? populations : [[populations]];
    cursor = populationSteps.reduce(populateCursor, cursor);
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
  function populateCursor (cursor, options) {
    return cursor.populate.apply(cursor, options);
  }
}

var find = findInternal.bind(null, 'find');
var findOne = findInternal.bind(null, 'findOne');

function toJSON (source, options) {
  var o = options || {};
  var text = [source.teaserHtml, source.introductionHtml, source.bodyHtml].join(' ');
  var article = source.toJSON();

  article.permalink = '/articles/' + article.slug;
  article.publication = datetimeService.field(article.publication);
  article.updated = datetimeService.field(article.updated);
  article.readingTime = estimate.text(text);

  if (source.populated('author')) {
    article.author = {
      displayName: article.author.displayName,
      slug: article.author.slug,
      twitter: article.author.twitter,
      website: article.author.website
    };
    if (source.author.email) {
      article.author.avatar = userService.getAvatar(source.author);
    }
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
    delete article.editorNoteHtml;
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
  delete article.echojs;
  delete article.tweet;
  delete article.fb;
  delete article.email;
  return article;
}

function relevant (article) {
  return { slug: article.slug, titleHtml: article.titleHtml };
}

function expandForListView (articles) {
  var extracted = metadataService.extractImages(articles);
  var expanded = articles.map(expand);
  return {
    articles: expanded,
    extracted: extracted
  };
  function expand (article) {
    var config = {meta: true, summary: true, id: false };
    var model = toJSON(article, config);
    var images = extracted.map[article._id];
    if (images && images.length) {
      model.cover = images[0];
    }
    return model;
  }
}

module.exports = {
  find: find,
  findOne: findOne,
  toJSON: toJSON,
  expandForListView: expandForListView
};
