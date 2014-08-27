'use strict';

var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;
var schema = new mongoose.Schema({
  email: { type: String, require: true, index: { unique: true }, trim: true }
}, { id: false, toObject: { getters: true }, toJSON: { getters: true } });

module.exports = mongoose.model('Subscriber', schema);
