var passport = require('passport'),
    user = require('../models/user.js'),
    LocalStrategy = require('passport-local').Strategy;

function configure(done){
    passport.use(new LocalStrategy({
            usernameField: 'email'
        },
        function(email, password, done) {
            user.findOne({ email: email }, function (err, user) {
                if (err) {
                    return done(err);
                }
                if (!user) {
                    return done(null, false);
                }
                user.validatePassword(password, function(err, isMatch) {
                    if (err){
                        return done(err);
                    }
                    if(!isMatch){
                        return done(null, false);
                    }
                    return done(null, user);
                });
            });
        }
    ));

    passport.serializeUser(function(user, done) {
        done(null, user._id);
    });

    passport.deserializeUser(function(id, done) {
        user.findOne({ _id: id }, function (err, user) {
            if(err){
                return done(err);
            }
            return done(null, user);
        });
    });

    process.nextTick(done);
}

module.exports = {
    configure: configure
};