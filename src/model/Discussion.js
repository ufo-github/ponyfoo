'use strict';

var mongoose = require('mongoose'),
    Comment = require('./schema/Comment.js'),
    ObjectId = mongoose.Schema.Types.ObjectId,
    schema = new mongoose.Schema({
        blog: { type: ObjectId, index: { unique: false }, require: true },
        entry: { type: ObjectId, index: { unique: false }, require: true },
        date: { type: Date, index: { unique: false }, require: true, 'default': Date.now },
        comments: [Comment]
    });

module.exports = mongoose.model('discussion', schema);