'use strict';

var mongoose = require('mongoose'),
    cryptoService = require('../service/cryptoService.js'),
    config = require('../config'),
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
    },{ id: false, toObject: { getters: true }, toJSON: { getters: true } });

schema.virtual('gravatar').get(function(){
    var hash = cryptoService.md5sync(this.email);

    return config.avatar.url + hash + config.avatar.query;
});

schema.pre('save', function(done) {
    var user = this;
    
    if(!user.passwordEncryption || !user.isModified('password')){
        user.passwordEncryption = true;
        return done();
    }

    cryptoService.encrypt(user.password, function(err, hash){
        if(err){
            return done(err);
        }
        user.password = hash;
        done();
    });
});

schema.methods.validatePassword = function(input, cb) {
    cryptoService.test(input, this.password, cb);
};

module.exports = mongoose.model('user', schema);