'use strict';

var mongoose = require('mongoose'),
    ObjectId = mongoose.Schema.Types.ObjectId,
    schema = new mongoose.Schema({
        blog: { type: ObjectId, index: { unique: false }, require: true },
        date: { type: Date, index: { unique: false }, require: true, 'default': Date.now },
        text: { type: String, require: true },
		author: {
            id: { type: ObjectId, require: true },
            displayName: { type: String, require: true },
            gravatar: { type: String, require: true },
            blogger: { type: Boolean, require: true }
        },
        root: { type: Boolean, require: true, 'default': false }
    });

module.exports = schema;