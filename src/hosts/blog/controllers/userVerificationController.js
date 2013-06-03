'use strict';

var async = require('async'),
    userVerificationService = require('../../../service/userVerificationService.js');

module.exports = {
    verifyEmail: function(req,res,next){
        async.waterfall([
            async.apply(userVerificationService.verifyToken, req.params.token),
            function(result, then){
                console.log(result);
                req.flash(result.status, result.message);
                then(null, result.user);
            },
            function(user, then){
                if(user){
                    req.login(user, then);
                }else{
                    then();
                }
            }
        ], function(err){
            if(err){
                return next(err);
            }
            res.redirect('/');
        });
    }
};