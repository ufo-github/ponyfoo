'use strict';

var mongoose = require('mongoose');
var schema = new mongoose.Schema({
  start: Date,
  end: Date,
  conference: String,
  venue: String,
  location: String,
  website: String,
  tags: [String]
});

module.exports = mongoose.model('Engagement', schema);
