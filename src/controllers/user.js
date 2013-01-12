var passport = require('passport'),
    rest = require('../services/rest.js'),
    text = require('../services/text.js'),
    models = require('../models/all.js'),
    model = models.user,
    crud = require('../services/crud.js')(model);

module.exports = {
    register: function(req,res){
        crud.create(req.body.user, {
            res: res,
            always: function(document){
                document.author = false; // prevents over-posting
            }
        });
    },
    login: passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/user/login'
    }),
    logout: function(req,res){
        req.logout();
        req.redirect('/');
    }
};