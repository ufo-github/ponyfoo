'use strict';

var mongoose = require('mongoose'),
    schema = new mongoose.Schema({
        email: { type: String, require: true, index: { unique: true }, trim: true },
        password: { type: String, require: true },
        passwordEncryption: { type: Boolean, 'default': true },
        created: { type: Date, require: true, 'default': Date.now },
        displayName: { type: String },
        facebookId: { type: String },
        githubId: { type: String },
        googleId: { type: String },
        linkedinId: { type: String },
        website: {
            title: { type: String },
            url: { type: String }
        },
        bio: { type: String },
        commentNotifications: { type: Boolean, 'default': true }
    }, { id: false, toObject: { getters: true }, toJSON: { getters: true } });

module.exports = function (conn) {
  return conn.model('user', schema);
};
