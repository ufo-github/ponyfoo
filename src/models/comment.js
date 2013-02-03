var mongoose = require('mongoose'),
    ObjectId = mongoose.Schema.Types.ObjectId,
    schema = new mongoose.Schema({
        text: { type: String, require: true },
        date: { type: Date, index: { unique: false }, require: true, default: Date.now },
		author: {
            id: { type: ObjectId, require: true },
            displayName: { type: String, require: true }
        }
    });

module.exports = mongoose.model('comment', schema);