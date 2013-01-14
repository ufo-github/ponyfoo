var passport = require('passport'),
    text = require('../services/text.js'),
    models = require('../models/all.js'),
    model = models.user,
    crud = require('../services/crud.js')(model);

module.exports = {
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

    login: passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/user/login'
    }),

    logout: function(req,res){
        req.logout();
        res.redirect('/');
    }
};