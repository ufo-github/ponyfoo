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
        if(!req.body.password || req.body.password.length === 0){
            req.flash('error', 'Password can\'t be empty');
            return res.redirect('/user/register');
        }

        model.findOne({ email: req.body.email }, function(err, document){
            if(document !== null){
                req.flash('error', 'Email already registered');
                return res.redirect('/user/register');
            }
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
        });
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