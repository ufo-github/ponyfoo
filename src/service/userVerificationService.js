'use strict';

var async = require('async'),
    moment = require('moment'),
    config = require('../config'),
    emailService = require('./emailService.js'),
    TokenUserVerification = require('../model/TokenUserVerification.js');

function createToken(user, done){
    var token = new TokenUserVerification({
        userUnverifiedId: user._id
    });
    token.save(function(err){
        done(err, token);
    });
}

function getLink(token){
    return config.server.authorityLanding + '/user/verify-email/' + token._id;
}

function sendEmail(user, token, done){
    var model = {
        to: user.email,
        subject: 'Account Email Verification',
        intro: 'Action required to complete your account registration',
        validation: {
            link: getLink(token),
            expires: moment(token.created).add('seconds', token.expires).fromNow()
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
    }
};