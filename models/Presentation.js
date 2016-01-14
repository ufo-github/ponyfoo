'use strict';

var mongoose = require('mongoose');
var schema = new mongoose.Schema({
  created: { type: Date, default: Date.now },
  presented: Date,
  title: String,
  slug: String,
  description: String,
  descriptionHtml: String,
  youtube: String,
  vimeo: String,
  speakerdeck: {
    id: String,
    ratio: Number
  },
  resources: [{
    title: String,
    titleHtml: String,
    url: String
  }]
});

module.exports = mongoose.model('Presentation', schema);
