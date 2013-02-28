var mongoose = require('mongoose'),
    config = require('../config.js'),
    ObjectId = mongoose.Schema.Types.ObjectId,
    schema = new mongoose.Schema({
        owner: { type: ObjectId, require: true },
        subdomain: { type: String, require: true },
        title: { type: String },
        legend: { type: String },
        description: { type: String },
        social: {
            rss: Boolean,
            email: String,
            github: String,
            stackoverflow: String,
            linkedin: String,
            twitter: String
        }
    });

module.exports = mongoose.model('blog', schema);