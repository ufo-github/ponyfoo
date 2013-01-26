var mongoose = require('mongoose'),
    config = require('../config.js'),
    schema = new mongoose.Schema({
        title: { type: String, require: true, trim: true },
        slug: { type: String, require: true, trim: true },
        brief: { type: String, require: true },
        text: { type: String, require: true },
        date: { type: Date, index: { unique: false }, require: true },
		updated: { type: Date, require: true, default: Date.now }
    });

schema.methods.getUrl = function() {
    var year = '/' + this.date.getYear(),
        month = '/' + this.date.getMonth() + 1, // 0-based,
        day = '/' + this.date.getDay(),
        slug = '/' + this.slug;

    return config.server.authority + year + month + day + slug;
};

module.exports = mongoose.model('entry', schema);