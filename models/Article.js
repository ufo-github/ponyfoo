'use strict';

var mongoose = require('mongoose');
var commentSchema = require('./schemas/comment');
var ObjectId = mongoose.Schema.Types.ObjectId;
var schema = new mongoose.Schema({
  author: { type: ObjectId, index: { unique: false }, require: true, ref: 'User' },
  created: { type: Date, index: { unique: false }, require: true, 'default': Date.now },
  updated: { type: Date, require: true, 'default': Date.now },
  publication: Date,
  status: { type: String, require: true },
  title: String,
  slug: { type: String, index: { unique: true }, require: true },
  sign: String,
  teaser: String,
  teaserHtml: String,
  body: String,
  bodyHtml: String,
  tags: [String],
  prev: { type: ObjectId, index: { unique: false }, ref: 'Article' },
  next: { type: ObjectId, index: { unique: false }, ref: 'Article' },
  related: [{ type: ObjectId, ref: 'Article' }],
  comments: [commentSchema],
  email: { type: Boolean, 'default': true },
  tweet: { type: Boolean, 'default': true },
  echojs: { type: Boolean, 'default': true }
}, { id: false, toObject: { getters: true }, toJSON: { getters: true } });

var api = mongoose.model('Article', schema);

api.validStatuses = ['draft', 'publish', 'published'];
api.schema = schema;

module.exports = api;
