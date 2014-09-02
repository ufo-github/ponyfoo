'use strict';

var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;
var schema = new mongoose.Schema({
  email: String,
  comment: String,
  commentHtml: String,
  website: String
}, { id: false, toObject: { getters: true }, toJSON: { getters: true } });

module.exports = mongoose.model('Comment', schema);
