'use strict';

var mongoose = require('mongoose');
var schema = new mongoose.Schema({
  name: String,
  source: String,
  topics: [String],
  email: { type: String, require: true, index: { unique: true }, trim: true },
  verified: { type: Boolean, 'default': false },
  created: { type: Date, require: true, 'default': Date.now }
}, { id: false, toObject: { getters: true }, toJSON: { getters: true } });

module.exports = mongoose.model('Subscriber', schema);
