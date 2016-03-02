'use strict';

var mongoose = require('mongoose');
var commentSchema = require('./schemas/comment');
var ObjectId = mongoose.Schema.Types.ObjectId;
var Mixed = mongoose.Schema.Types.Mixed;
var schema = new mongoose.Schema({
  author: { type: ObjectId, index: { unique: false }, require: true, ref: 'User' },
  created: { type: Date, index: { unique: false }, require: true, 'default': Date.now },
  updated: { type: Date, require: true, 'default': Date.now },
  slug: { type: String, index: { unique: true }, require: true },
  publication: Date,
  status: { type: String, index: { unique: false }, require: true },
  statusReach: String, // [undefined, 'early birds', 'everyone']
  bird: String,
  issue: { type: Number, index: { unique: true, sparse: true }, require: false },
  summary: String,
  summaryText: String,
  summaryHtml: String,
  contentHtml: String,
  sections: [Mixed],
  comments: [commentSchema],
  email: { type: Boolean, 'default': true },
  tweet: { type: Boolean, 'default': true },
  fb: { type: Boolean, 'default': true },
  echojs: { type: Boolean, 'default': true },
  lobsters: { type: Boolean, 'default': false },
  hn: { type: Boolean, 'default': false },
  hnDiscuss: String
});

schema.virtual('name').get(computeName);
schema.virtual('title').get(computeTitle);

var model = mongoose.model('WeeklyIssue', schema);

model.validStatuses = ['draft', 'ready', 'released'];

module.exports = model;

function computeName () {
  if (this.issue) {
    return 'Issue #' + this.issue;
  }
  return this.slug;
}

function computeTitle () {
  return 'Pony Foo Weekly \u2014 ' + this.name;
}
