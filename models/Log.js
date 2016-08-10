'use strict';

const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  level: String,
  message: String,
  meta: {}
});

module.exports = mongoose.model('Log', schema);
