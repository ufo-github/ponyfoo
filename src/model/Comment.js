'use strict';

var mongoose = require('mongoose'),
    comment = require('./schema/Comment.js');

module.exports = mongoose.model('comment', comment);