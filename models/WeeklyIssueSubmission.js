'use strict';

var mongoose = require('mongoose');
var Mixed = mongoose.Schema.Types.Mixed;
var schema = new mongoose.Schema({
  created: { type: Date, index: { unique: false }, require: true, 'default': Date.now },
  status: { type: String, index: { unique: false }, require: true }, // ['incoming', 'accepted', 'used']
  slug: { type: String, index: { unique: true }, require: true },
  submitter: String,
  email: String,
  comment: String,
  commentHtml: String,
  type: String, // ['suggestion', 'sponsor']
  subtype: String, // ['suggestion', 'primary', 'secondary', 'job']
  amount: Number,
  invoice: Boolean,
  accepted: Boolean,
  dates: [Date],
  section: Mixed
});

module.exports = mongoose.model('WeeklyIssueSubmission', schema);
