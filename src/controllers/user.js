var config = require('../config.js'),
    passport = require('passport'),
    text = require('../services/text.js'),
    model = require('../models/user.js'),
    crud = require('../services/crud.js')(model);

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

    model.findOne({ email: email }, function(err, document){
        if(document !== null){
            req.flash('error', 'Email already registered');
            shouldCreate = false;
        }
        if(shouldCreate === false){
            return res.redirect(config.auth.register);
        }

        crud.create(req.body, {
            res: res,
            always: function(user){
                user.blogger = false; // prevent over-posting.
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

var authOpts =  {
    failureRedirect: config.auth.login,
    failureFlash: true
};

function provider(name, options){
    return {
        auth: passport.authenticate(name, options),
        callback: passport.authenticate(name, authOpts)
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

module.exports = {
    guard: function(req,res,next){
        if(!!req.user){
            redirect(req,res);
        }
        next();
    },

    rememberReturnUrl: rememberReturnUrl,
    redirect: redirect,

    register: register,
    local: passport.authenticate('local', authOpts),

    facebook: provider('facebook', { scope: 'email' }),
    github: provider('github'),
    google: provider('google'),
    linkedin: provider('linkedin', { scope: ['r_basicprofile', 'r_emailaddress'] }),

    logout: function(req,res){
        req.logout();
        res.redirect('/');
    }
};