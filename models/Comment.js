'use strict';

var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;
var schema = new mongoose.Schema({
  created: { type: Date, index: { unique: false }, require: true, 'default': Date.now },
  author: String,
  email: String,
  content: String,
  contentHtml: String,
  site: String,
  parent: { type: ObjectId, index: { unique: false }, ref: 'Comment' }
}, { id: false, toObject: { getters: true }, toJSON: { getters: true } });

module.exports = mongoose.model('Comment', schema);
