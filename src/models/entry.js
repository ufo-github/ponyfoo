var mongoose = require('mongoose'),
    schema = new mongoose.Schema({
        title: { type: String, require: true, trim: true },
        brief: { type: String, require: true, trim: true },
        text: { type: String, require: true, trim: true },
        date: { type: Date, index: { unique: true }, require: true },
		updated: { type: Date, require: true, default: Date.now }
    });

module.exports.model = mongoose.model('entry', schema);