'use strict';

var mongoose = require('mongoose'),
    ObjectId = mongoose.Schema.Types.ObjectId,
    schema = new mongoose.Schema({
        unverifiedId: { type: ObjectId, require: true },
        created: { type: Date, 'default': Date.now },
        expires: { type: Number, 'default': 7200 },
        used: { type: Date, 'default': null }
    }, { id: false });

module.exports = function (conn) {
  return conn.model('tokenUserVerification', schema);
};
