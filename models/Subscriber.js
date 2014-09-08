'use strict';

var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;
var schema = new mongoose.Schema({
  name: String,
  source: String,
  email: { type: String, require: true, index: { unique: true }, trim: true },
  verified: { type: Boolean, 'default': false }
}, { id: false, toObject: { getters: true }, toJSON: { getters: true } });

module.exports = mongoose.model('Subscriber', schema);
