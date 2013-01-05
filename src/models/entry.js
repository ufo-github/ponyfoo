var mongoose = require('mongoose'),
    schema = new mongoose.Schema({
        title: { type: String, require: true, trim: true },
        brief: { type: String, require: true },
        text: { type: String, require: true },
        date: { type: Date, index: { unique: true }, require: true },
		updated: { type: Date, require: true },
        published: { type: Boolean, require: true }
    });

module.exports.model = mongoose.model('entry', schema);