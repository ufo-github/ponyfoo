'use strict';

var mongoose = require('mongoose');
var schema = new mongoose.Schema({
  created: { type: Date, index: { unique: false }, require: true, 'default': Date.now },
  slug: { type: String, index: { unique: true }, require: true },
  title: String,
  titleText: String,
  titleHtml: String,
  description: String,
  descriptionText: String,
  descriptionHtml: String
});

module.exports = mongoose.model('KnownTag', schema);
