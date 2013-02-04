var mongoose = require('mongoose'),
    comment = require('./schema/comment.js');

module.exports = mongoose.model('comment', comment);