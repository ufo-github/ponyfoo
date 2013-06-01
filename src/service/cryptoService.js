'use strict';

var bcrypt = require('bcrypt'),
    crypto = require('crypto'),
    config = require('../config');

function md5sync(value){
    return crypto.createHash('md5').update(value).digest('hex');
}

module.exports = {
    encrypt: function(value, done){
        bcrypt.genSalt(config.security.saltWorkFactor, function(err, salt) {
            if (err){
                return done(err);
            }

            bcrypt.hash(value, salt, done);
        });
    },
    test: function(value, hash, done){
        if (value === null ||
            value === undefined ||
            hash === null ||
            hash === undefined){
            process.nextTick(function(){
                done(null, false);
            });
            return;
        }

        bcrypt.compare(value, hash, done);
    },
    md5: function(value, done){
        process.nextTick(function(){
            done(null, md5sync(value));
        });
    },
    md5sync: md5sync
};