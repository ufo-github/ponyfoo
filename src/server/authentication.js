var passport = require('passport'),
    models = require('../models/all.js'),
    LocalStrategy = require('passport-local').Strategy;

function configure(){
    passport.use(new LocalStrategy({
            usernameField: 'email'
        },
        function(email, password, done) {
            models.user.findOne({ email: email }, function (err, user) {
                if (err) {
                    return done(err);
                }
                if (!user) {
                    return done(null, false);
                }
                if (!user.validatePassword(password)) {
                    return done(null, false);
                }
                return done(null, user);
            });
        }
    ));

    passport.serializeUser(function(user, done) {
        done(null, user._id);
    });

    passport.deserializeUser(function(id, done) {
        models.user.findOne({ _id: id }, function (err, user) {
            if(err){
                return done(err);
            }
            return done(null, user);
        });
    });
}

module.exports = {
    configure: configure
};