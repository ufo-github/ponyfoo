'use strict';

var async = require('async'),
    moment = require('moment'),
    mongoose = require('mongoose'),
    config = require('../config'),
    emailService = require('./emailService.js'),
    userService = require('./userService.js'),
    TokenPasswordReset = require('../model/TokenPasswordReset.js'),
    User = require('../model/User.js');

function createToken(user, done){
    var token = new TokenPasswordReset({
        userId: user._id
    });
    token.save(function(err){
        done(err, user, token);
    });
}

function getLink(token){
    return config.server.authorityBlog + '/user/password-reset/' + token._id;
}

function getExpiration(token){
    return moment(token.created).add('seconds', token.expires);
}

function sendEmail(user, token, done){
    var model = {
        to: user.email,
        subject: 'Account Password Reset',
        intro: 'Action required to reset your account password',
        reset: {
            link: getLink(token),
            expires: getExpiration(token).fromNow()
        }
    };
    emailService.send('password_reset', model, done);
}

function validateToken(token, done){
    if(!token || token.used){
        return done(null, false);
    }

    var now = new Date(),
        expiration = getExpiration(token).toDate();

    done(null, expiration > now);
}

module.exports = {
    emitToken: function(email, done){
        var result;

        async.waterfall([
            function(next){
                User.findOne({ email: email }, next);
            },
            function(user, next){
                if(user){
                    createToken(user, next);   
                }else{
                    result = {
                        status: 'error',
                        message: 'Email not registered!'
                    };
                    next(result);
                }
            },
            function(user, token, next){
                sendEmail(user, token, next);
            }
        ], function(err){    
            if(err === result){
                done(null, result);
            }else if(err){
                done(err);
            }else{
                done(null, {
                    status: 'success',
                    message: 'Password reset instructions email sent!'
                });
            }
        });
    },
    validateToken: function(tokenId, done){
        TokenPasswordReset.findOne({ _id: mongoose.Types.ObjectId(tokenId) }, function(err, token){
            if(err){
                return done(err);
            }

            validateToken(token, done);
        });
    },
    updatePassword: function(tokenId, password, done){
        TokenPasswordReset.findOne({ _id: mongoose.Types.ObjectId(tokenId) }, function(err, token){
            if(err){
                return done(err);
            }

            validateToken(token, function(err, valid){
                if(err || !valid){
                    return done(err, valid);
                }

                token.used = new Date();
                token.save(function(err){
                    if(err){
                        return done(err);
                    }

                    userService.setPassword(token.userId, password, function(err){
                        done(err, !err);
                    });
                });
            });
        });
    }
};