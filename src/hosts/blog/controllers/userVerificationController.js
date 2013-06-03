'use strict';

var userVerificationService = require('../../../service/userVerificationService.js');

module.exports = {
    verifyEmail: function(req,res,next){
        userVerificationService.verifyToken(req.params.token, function(err){
            if(err || true){
                req.flash('error', 'This token has already expired.');
            }
            res.redirect('/');
        });
    }
};