'use strict';

var config = require('../../../config'),
    userUnverifiedService = require('../../../service/userUnverifiedService.js'),
    passport = require('passport'),
    authenticationOptions = {
        failureRedirect: config.auth.login,
        failureFlash: true
    },
    login = passport.authenticate('local', authenticationOptions);

function ancient(req, res, next){
    if(!req.body.create){
        login(req, res, next);
    }else{
        register(req, res, next);
    }
}

function register(req, res, next){
    var model = {
        email: req.body.email,
        password: req.body.password
    };

    userUnverifiedService.register(model, function(err, validation){
        if(err){
            return next(err);
        }

        if(validation){
            req.flash('error', validation);
        }else{
            req.flash('success', 'Activation instructions sent to your email!');
        }
        
        return res.redirect(config.auth.login);
    });
}

function provider(name, options){
    return {
        auth: passport.authenticate(name, options),
        callback: passport.authenticate(name, authenticationOptions)
    };
}

function rememberReturnUrl(req,res,next){
    req.session.redirect = req.query.redirect;
    next();
}

function redirect(req,res){
    var sessionRedirect = req.session.redirect;
    delete req.session.redirect;
    res.redirect(req.body.redirect || sessionRedirect || config.auth.success);
}

function requireAnonymous(req,res,next){
    if(!!req.user){
        redirect(req,res);
    }
    next();
}

function logout(req,res){
    req.logout();
    res.redirect('/');
}

module.exports = {
    requireAnonymous: requireAnonymous,

    rememberReturnUrl: rememberReturnUrl,
    redirect: redirect,

    login: login,
    ancient: ancient,

    facebook: provider('facebook', { scope: 'email' }),
    github: provider('github'),
    google: provider('google'),
    linkedin: provider('linkedin', { scope: ['r_basicprofile', 'r_emailaddress'] }),

    logout: logout
};