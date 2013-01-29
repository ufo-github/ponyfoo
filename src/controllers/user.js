var passport = require('passport'),
    text = require('../services/text.js'),
    model = require('../models/user.js'),
    crud = require('../services/crud.js')(model);

module.exports = {
    guard: function(req,res,next){
        if(!!req.user){
            return res.redirect('/');
        }
        return next();
    },

    register: function(req,res, next){
        crud.create(req.body, {
            res: res,
            always: function(user){
                user.author = false; // prevent over-posting.
            },
            writeHead: false,
            then: function(user){
                req.login(user, function(err) {
                    if (err) {
                        return next(err);
                    }
                    return res.redirect('/');
                });
            }
        });
    },

    login: function(req,res,next){
        res.locals.flash.error = req.flash('error');
        next();
    },

    authenticate: passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/user/login',
        failureFlash: true
    }),

    logout: function(req,res){
        req.logout();
        res.redirect('/');
    }
};