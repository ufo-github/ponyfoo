'use strict';

var mongoose = require('mongoose');
var schema = new mongoose.Schema({
  created: { type: Date, index: { unique: false }, require: true, 'default': Date.now },
  items: mongoose.Schema.Types.Mixed
});

module.exports = mongoose.model('Setting', schema);
