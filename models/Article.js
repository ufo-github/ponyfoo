'use strict';

var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;
var schema = new mongoose.Schema({
  author: { type: ObjectId, index: { unique: false }, require: true, ref: 'User' },
  created: { type: Date, index: { unique: false }, require: true, 'default': Date.now },
  updated: { type: Date, require: true, 'default': Date.now },
  publication: Date,
  status: String, // 'draft', 'scheduled', 'published'
  title: String,
  slug: { type: String, index: { unique: true }, require: true },
  introduction: String,
  //introductionHtml: String,
  body: String,
  //bodyHtml: String,
  tags: [String],
  // prev: ObjectId,
  // next: ObjectId,
  // related: [{ type: ObjectId, ref: 'Article' }],
  // comments: [{ type: ObjectId, ref: 'Comment' }]
}, { id: false, toObject: { getters: true }, toJSON: { getters: true } });

schema.virtual('permalink').get(computePermalink);

function computePermalink () {
  return '/' + this.slug;
}

module.exports = mongoose.model('Article', schema);
