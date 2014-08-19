'use strict';

var mongoose = require('mongoose');
var markdownService = require('../services/markdown');
var cryptoService = require('../services/crypto');
var ObjectId = mongoose.Schema.Types.ObjectId;
var schema = new mongoose.Schema({
  author: { type: ObjectId, index: { unique: false }, require: true, ref: 'User' },
  created: { type: Date, index: { unique: false }, require: true, 'default': Date.now },
  updated: { type: Date, require: true, 'default': Date.now },
  publication: { type: String, require: false },
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
schema.pre('save', recompute);

function computePermalink () {
  return '/' + this.slug;
}

function articleSignature (a) {
  return cryptoService.md5([a.title, a.status, a.introduction, a.body].concat(a.tags).join(' '));
}

function recompute (next) {
  var relationshipService = require('../services/relationship');
  var oldSign = this.sign;

  this.sign = articleSignature(this);
  this.introductionHtml = markdownService.compile(this.introduction);
  this.bodyHtml = markdownService.compile(this.body);
  this.updated = Date.now;

  if (oldSign !== this.sign) {
    relationshipService.computeFor(this, next);
  } else {
    next();
  }
}

module.exports = mongoose.model('Article', schema);
module.exports.validStatuses = ['draft', 'publish', 'published'];
