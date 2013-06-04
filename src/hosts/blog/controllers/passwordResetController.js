'use strict';

var async = require('async'),
    config = require('../../../config'),
    passwordResetService = require('../../../service/passwordResetService.js'),
    restService = require('../../../service/restService.js'),
    expired = 'This password reset token has expired';

function sendJson(req, res, result){
    var type = result.status === 'success' ? 'ok' : 'badRequest';

    restService[type](req, res, {
        validation: [result.message]
    });
}

module.exports = {
    requestPasswordReset: function(req,res,next){
        if(!req.body.email){
            return sendJson(req, res, {
                status: 'error',
                message: 'Enter your email in the input below'
            });
        }

        passwordResetService.emitToken(req.body.email, function(err, result){
            if(err){
                return next(err);
            }
            sendJson(req, res, result);
        });
    },
    validateToken: function(req,res,next){
        passwordResetService.validateToken(req.params.token, function(err, valid){
            if(err){
                return next(err);
            }

            if(!valid){
                req.flash('error', expired);
                res.redirect('/');
            }else{
                next(); // continue to the view route
            }
        });
    },
    resetPassword: function(req,res,next){
        if(!req.body.password){
            return sendJson(req, res, {
                status: 'error',
                message: 'Your password cannot be empty!'
            });
        }

        passwordResetService.updatePassword(req.params.token, req.body.password, function(err, valid){
            if(err){
                return next(err);
            }

            sendJson(req, res, valid ? {
                status: 'success',
                message: 'Your password was successfully updated'
            } : {
                status: 'error',
                message: expired
            });
        });
    }
};