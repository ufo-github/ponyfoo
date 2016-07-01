'use strict';

var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;
var schema = new mongoose.Schema({
  created: { type: Date, default: Date.now },
  slug: { type: String, index: { unique: true }, require: true },
  date: Date,
  customerParty: { type: ObjectId, index: { unique: false }, ref: 'InvoiceParty' },
  customer: {
    name: String,
    details: String
  },
  paymentParty: { type: ObjectId, index: { unique: false }, ref: 'InvoiceParty' },
  payment: {
    name: String,
    details: String
  },
  items: [{
    summary: String,
    amount: Number,
    rate: Number
  }],
  paid: Boolean
});

module.exports = mongoose.model('Invoice', schema);
