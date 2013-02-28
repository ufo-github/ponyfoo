var mongoose = require('mongoose'),
    config = require('../config.js'),
    ObjectId = mongoose.Schema.Types.ObjectId,
    schema = new mongoose.Schema({
        owner: { type: ObjectId, require: true }
    });

module.exports = mongoose.model('blog', schema);