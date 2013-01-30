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
    }

    return shouldCreate;
}

module.exports = {
    guard: function(req,res,next){
        if(!!req.user){
            return res.redirect('/');
        }
        return next();
    },

    register: function(req,res, next){
        var shouldCreate = validate(req);

        model.findOne({ email: email }, function(err, document){
            if(document !== null){
                req.flash('error', 'Email already registered');
                shouldCreate = false;
            }
            if(shouldCreate === false){
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