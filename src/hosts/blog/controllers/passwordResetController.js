'use strict';

var async = require('async'),
    config = require('../../../config'),
    passwordResetService = require('../../../service/passwordResetService.js');

module.exports = {
    requestPasswordReset: function(req,res,next){
        passwordResetService.emitToken(req.body.email, function(err, result){
            if(err){
                return next(err);
            }

// TODO: send json instead of trying to flash it!
            req.flash(result.status, result.message);
            res.redirect(config.auth.login);
        });
    },
    resetPassword: function(req,res,next){
        next();
    }
};