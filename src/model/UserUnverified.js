'use strict';

var mongoose = require('mongoose'),
    cryptoService = require('../service/cryptoService.js'),
    config = require('../config'),
    schema = new mongoose.Schema({
        email: { type: String, require: true },
        password: { type: String, require: true }
    },{ id: false });

schema.pre('save', function(done) {
    var user = this;

    if (!user.isModified('password')){
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

module.exports = mongoose.model('userUnverified', schema);