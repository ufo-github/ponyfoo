'use strict';

var mongoose = require('mongoose');
var schema = new mongoose.Schema({
  created: { type: Date, default: Date.now },
  slug: { type: String, index: { unique: true }, require: true },
  date: Date,
  customer: {
    name: String,
    details: [String]
  },
  payment: {
    name: String,
    details: [String]
  },
  items: [{
    summary: String,
    amount: Number,
    rate: Number
  }],
  paid: Boolean
});

module.exports = mongoose.model('Invoice', schema);
