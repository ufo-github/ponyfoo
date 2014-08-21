'use strict';

var _ = require('lodash');
var winston = require('winston');
var mongoose = require('mongoose');
var markdownService = require('../services/markdown');
var cryptoService = require('../services/crypto');
var articleSearch = require('../services/articleSearch');
var ObjectId = mongoose.Schema.Types.ObjectId;
var schema = new mongoose.Schema({
  author: { type: ObjectId, index: { unique: false }, require: true, ref: 'User' },
  created: { type: Date, index: { unique: false }, require: true, 'default': Date.now },
  updated: { type: Date, require: true, 'default': Date.now },
  publication: { type: Date, require: false },
  status: { type: String, require: true },
  title: String,
  slug: { type: String, index: { unique: true }, require: true },
  sign: String,
  introduction: String,
  introductionHtml: String,
  body: String,
  bodyHtml: String,
  tags: [String],
  prev: { type: ObjectId, index: { unique: false }, ref: 'Article' },
  next: { type: ObjectId, index: { unique: false }, ref: 'Article' },
  related: [{ type: ObjectId, ref: 'Article' }],
  comments: [{ type: ObjectId, ref: 'Comment' }]
}, { id: false, toObject: { getters: true }, toJSON: { getters: true } });

schema.virtual('permalink').get(computePermalink);
schema.pre('save', beforeSave);
schema.post('save', afterSave);

function computePermalink () {
  return '/articles/' + this.slug;
}

function computeSignature (a) {
  return cryptoService.md5([a.title, a.status, a.introduction, a.body].concat(a.tags).join(' '));
}

function beforeSave (next) {
  var article = this;
  var oldSign = article.sign;

  article.sign = computeSignature(article);
  article.introductionHtml = markdownService.compile(article.introduction);
  article.bodyHtml = markdownService.compile(article.body);
  article.updated = Date.now();

  if (oldSign !== article.sign && article.status === 'published') {
    articleSearch.similar(article, related);
  } else {
    next();
  }

  function related (err, articles) {
    if (err) {
      next(err); return;
    }
    article.related = _(articles)
      .reject({ _id: article._id })
      .pluck('_id')
      .first(6)
      .value();

    next();
  }
}

function afterSave () {
  articleSearch.rebuild(function (err) {
    if (err) {
      winston.info('Error rebuilding article search index', err);
    }
  });
}

module.exports = mongoose.model('Article', schema);
module.exports.validStatuses = ['draft', 'publish', 'published'];
