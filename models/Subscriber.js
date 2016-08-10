'use strict';

const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  name: String,
  source: String,
  topics: [String], // ['announcements', 'articles', 'newsletter']
  email: { type: String, require: true, index: { unique: true }, trim: true },
  verified: { type: Boolean, 'default': false },
  patron: { type: Boolean, 'default': false },
  created: { type: Date, require: true, 'default': Date.now }
}, { id: false, toObject: { getters: true }, toJSON: { getters: true } });

schema.index({ topics: 1 });

module.exports = mongoose.model('Subscriber', schema);
