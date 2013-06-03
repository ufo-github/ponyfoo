'use strict';

var async = require('async'),
    moment = require('moment'),
    config = require('../config'),
    emailService = require('./emailService.js'),
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
    return config.server.authorityLanding + '/user/password-reset/' + token._id;
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
                        message: 'No users associated to the provided email address'
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
    }
};