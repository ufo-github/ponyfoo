'use strict';

var mongoose = require('mongoose'),
    config = require('../config'),
    ObjectId = mongoose.Schema.Types.ObjectId,
    schema = new mongoose.Schema({
        userId: { type: ObjectId, require: true },
        created: { type: Date, 'default': Date.now },
        expires: { type: Number, 'default': config.tokenExpiration },
        used: { type: Date, 'default': null }
    },{ id: false });

module.exports = mongoose.model('tokenPasswordReset', schema);