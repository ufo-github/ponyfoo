var passport = require('passport');

module.exports = {
    register: function(req,res){
        // TODO: register user with mongoose.
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