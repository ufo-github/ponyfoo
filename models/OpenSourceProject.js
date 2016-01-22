'use strict';

var mongoose = require('mongoose');
var schema = new mongoose.Schema({
  added: { type: Date, default: Date.now },
  name: String,
  repo: String,
  branch: String,
  screenshot: String,
  teaser: String,
  description: String,
  descriptionHtml: String
});

module.exports = mongoose.model('OpenSourceProject', schema);
