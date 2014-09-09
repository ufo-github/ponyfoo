'use strict';

var mongoose = require('mongoose'),
    schema = new mongoose.Schema({
        date: { type: Date, default: Date.now, require: true },
        level: { type: String },
        message: { type: String },
        exception: { type: String }
    });

module.exports = function (conn) {
  return conn.model('log', schema);
};
