var mongoose = require('mongoose'),
    schema = new mongoose.Schema({
        email: { type: String, require: true, trim: true },
        password: { type: String, require: true },
		created: { type: Date, require: true, default: Date.now }
    });

module.exports.model = mongoose.model('user', schema);