'use strict';

var mongoose = require('mongoose');
var schema = require('./schemas/comment');

module.exports = mongoose.model('Comment', schema);
