var passport = require('passport'),
    rest = require('../services/rest.js'),
    text = require('../services/text.js'),
    models = require('../models/all.js'),
    model = models.user,
    crud = require('../services/crud.js')(model);

module.exports = {
    register: function(req,res, next){
        crud.create(req.body, {
            res: res,
            always: function(user){
                user.author = true; // prevents over-posting
            },
            then: function(user){
                res.redirect('/'); // TODO: appropriate redirect
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