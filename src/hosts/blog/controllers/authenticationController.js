'use strict';

var config = require('../../../config'),
    passport = require('passport'),
    User = require('../../../model/User.js'),
    crud = require('../../../service/crudService.js')(User),
    authenticationOptions = {
        failureRedirect: config.auth.login,
        failureFlash: true
    };

function validate(req){
    var email = req.body.email,
        password = req.body.password,
        shouldCreate;

    if(typeof password !== 'string' || password.length === 0){
        req.flash('error', 'Password can\'t be empty');
        shouldCreate = false;
    }
    if(typeof email !== 'string' || email.length === 0){
        req.flash('error', 'Email can\'t be empty');
        shouldCreate = false;
    }else if(config.env.production && config.regex.email.test(email) === false){
        req.flash('error', 'Email must be a valid address');
        shouldCreate = false;
    }else{
        req.body.email = email.trim().toLowerCase();
    }

    return shouldCreate;
}

function register(req,res, next){
    var shouldCreate = validate(req),
        email = req.body.email;

    User.findOne({ email: email }, function(err, user){
        if(user !== null){
            req.flash('error', 'Email already registered');
            shouldCreate = false;
        }
        if(shouldCreate === false){
            return res.redirect(config.auth.register);
        }

        crud.create(req.body, {
            res: res,
            always: function(user){
                user.displayName = email.split('@')[0];
            },
            writeHead: false,
            then: function(user){
                req.login(user, function(err) {
                    if (err) {
                        return next(err);
                    }
                    next();
                });
            }
        });
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

function requireLogon(req,res,next){
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
    requireLogon: requireLogon,

    rememberReturnUrl: rememberReturnUrl,
    redirect: redirect,

    register: register,
    local: passport.authenticate('local', authenticationOptions),

    facebook: provider('facebook', { scope: 'email' }),
    github: provider('github'),
    google: provider('google'),
    linkedin: provider('linkedin', { scope: ['r_basicprofile', 'r_emailaddress'] }),

    logout: logout
};