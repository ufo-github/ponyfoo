'use strict';

var mongoose = require('mongoose'),
    Comment = require('./schema/Comment.js');

module.exports = mongoose.model('comment', Comment);