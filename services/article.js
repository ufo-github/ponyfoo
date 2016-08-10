'use strict';

const url = require('url');
const contra = require('contra');
const moment = require('moment');
const estimate = require('estimate');
const env = require('../lib/env');
const Article = require('../models/Article');
const cryptoService = require('./crypto');
const commentService = require('./comment');
const datetimeService = require('./datetime');
const metadataService = require('./metadata');
const userService = require('./user');
const gitWeb = env('GIT_ARTICLES_WEB');

function findInternal (method, query, options, done) {
  if (done === void 0) {
    done = options; options = {};
  }
  if (options.sort === void 0) {
    options.sort = { publication: -1, updated: -1 };
  }

  let cursor = Article[method](query);
  const populations = options.populate;
  let populationSteps;
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

const find = findInternal.bind(null, 'find');
const findOne = findInternal.bind(null, 'findOne');

function toJSON (source, options) {
  const o = options || {};
  const text = [source.teaserHtml, source.introductionHtml, source.bodyHtml].join(' ');
  const article = source.toJSON();

  article.permalink = '/articles/' + article.slug;
  article.publication = datetimeService.field(article.publication);
  article.updated = datetimeService.field(article.updated);
  article.readingTime = estimate.text(text);
  article.gitHref = url.resolve(gitWeb, `${moment.utc(article.created).format('YYYY/MM-DD')}--${article.slug}`);

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
  const extracted = metadataService.extractImages(articles);
  const expanded = articles.map(expand);
  return {
    articles: expanded,
    extracted: extracted
  };
  function expand (article) {
    const config = {meta: true, summary: true, id: false };
    const model = toJSON(article, config);
    const images = extracted.map[article._id];
    if (images && images.length) {
      model.cover = images[0];
    }
    return model;
  }
}

function computeSignature (article) {
  const parts = [
    article.titleMarkdown,
    article.slug,
    article.status,
    article.heroImage || '',
    article.summary || '',
    article.teaser,
    article.editorNote || '',
    article.introduction,
    article.body
  ];
  const partsWithTags = parts.concat(article.tags).join(' ');
  const sign = cryptoService.md5(partsWithTags);
  return sign;
}

function remove (article, done) {
  if (!article) {
    done(null); return;
  }

  contra.series([
    populate,
    removal,
    unlinkLeft,
    unlinkRight
  ], done);

  function populate (next) {
    article.populate('prev next', next);
  }

  function removal (next) {
    article.status = 'deleted';
    article.save(next);
  }

  function unlinkLeft (next) {
    if (!article.prev) {
      next(); return;
    }
    article.prev.next = article.next;
    article.prev.save(next);
  }

  function unlinkRight (next) {
    if (!article.next) {
      next(); return;
    }
    article.next.prev = article.prev;
    article.next.save(next);
  }
}

module.exports = {
  find,
  findOne,
  toJSON,
  expandForListView,
  computeSignature,
  remove
};
