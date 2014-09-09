'use strict';

var mongoose = require('mongoose'),
    schema = new mongoose.Schema({
        from: { type: String, require: true },
        title: { type: String, require: true },
        text: { type: String, require: true }
    });

module.exports = schema;