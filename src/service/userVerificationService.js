'use strict';

var async = require('async'),
    moment = require('moment'),
    mongoose = require('mongoose'),
    config = require('../config'),
    emailService = require('./emailService.js'),
    userService = require('./userService.js'),
    TokenUserVerification = require('../model/TokenUserVerification.js'),
    UserUnverified = require('../model/UserUnverified.js'),
    User = require('../model/User.js');

function createToken(user, done){
    var token = new TokenUserVerification({
        unverifiedId: user._id
    });
    token.save(function(err){
        done(err, token);
    });
}

function getLink(token){
    return config.server.authorityBlog + '/user/verify-email/' + token._id;
}

function getExpiration(token){
    return moment(token.created).add('seconds', token.expires);
}

function sendEmail(user, token, done){
    var model = {
        to: user.email,
        subject: 'Account Email Verification',
        intro: 'Action required to complete your account registration',
        validation: {
            link: getLink(token),
            expires: getExpiration(token).fromNow()
        }
    };
    emailService.send('verify_address', model, done);
}

module.exports = {
    emitToken: function(user, done){
        async.waterfall([
            function(next){
                createToken(user, next);
            },
            function(token, next){
                sendEmail(user, token, next);
            }
        ], done);
    },
    verifyToken: function(tokenId, done){
        var result;

        async.waterfall([
            function(next){
                TokenUserVerification.findOne({ _id: mongoose.Types.ObjectId(tokenId) }, next);
            },
            function(token, next){
                if(!token || token.used){
                    expired(next);
                }else{
                    next(null, token);
                }
            },
            function(token, next){
                var now = new Date(),
                    expiration = getExpiration(token).toDate();

                if(now > expiration){
                    expired(next);
                }else{
                    next(null, token);
                }
            },
            function(token, next){
                UserUnverified.findOne({ _id: token.unverifiedId }, function(err, unverified){
                    if(err){
                        return next(err);
                    }
                    next(null, token, unverified);
                });
            },
            function(token, unverified, next){
                User.findOne({ email: unverified.email }, function(err, user){
                    if(err){
                        return next(err);
                    }
                    if(user){ // someone took the email address already.
                        return expired(next);
                    }
                    next(null, token, unverified);
                });
            },
            function(token, unverified, next){
                token.used = new Date();
                token.save(function(err){
                    next(err, unverified);
                });
            },
            function(unverified, next){
                userService.createUsingEncryptedPassword(unverified.email, unverified.password, next);
            },
            function(user, next){
                next(null, {
                    status: 'success',
                    message: 'Thanks for validating your email address!',
                    user: user
                });
            }
        ], function(err, user){
            if(err === result){
                return done(null, result);
            }
            done(err, user);
        });

        function expired(next){
            result = {
                status: 'error',
                message: 'This validation token has expired'
            };
            next(result);
        }
    }
};