'use strict';

var async = require('async'),
    config = require('../../../config'),
    passwordResetService = require('../../../service/passwordResetService.js'),
    restService = require('../../../service/restService.js');

module.exports = {
    requestPasswordReset: function(req,res,next){
        passwordResetService.emitToken(req.body.email, function(err, result){
            if(err){
                return next(err);
            }

            var type = result.status === 'success' ? 'ok' : 'badRequest';

            restService[type](req, res, {
                validation: [result.message]
            });
        });
    },
    resetPassword: function(req,res,next){
        next();
    }
};