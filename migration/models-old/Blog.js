'use strict';

var mongoose = require('mongoose'),
    ObjectId = mongoose.Schema.Types.ObjectId,
    schema = new mongoose.Schema({
        owner: { type: ObjectId, require: true },
        slug: { type: String, require: true },
        title: { type: String },
        legend: { type: String },
        meta: { type: String },
        description: { type: String },
        thumbnail: { type: String },
        social: {
            rss: Boolean,
            email: String,
            github: String,
            stackoverflow: String,
            careers: String,
            linkedin: String,
            twitter: String
        }
    });

module.exports = function (conn) {
  return conn.model('blog', schema);
};
