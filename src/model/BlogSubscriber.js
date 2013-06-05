'use strict';

var mongoose = require('mongoose'),
    ObjectId = mongoose.Schema.Types.ObjectId,
    schema = new mongoose.Schema({
        blogId: { type: ObjectId, require: true },
        userId: { type: ObjectId },
        email: { type: String },
        created: { type: Date, 'default': Date.now },
        enabled: { type: Boolean }
    });

module.exports = mongoose.model('blogSubscriber', schema);