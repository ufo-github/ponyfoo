var passport = require('passport'),
    config = require('../config.js'),
    user = require('../models/user.js'),
    LocalStrategy = require('passport-local').Strategy,
    FacebookStrategy = require('passport-facebook').Strategy,
    GoogleStrategy = require('passport-google').Strategy,
    GitHubStrategy = require('passport-github').Strategy;

function setupLocal(){
    passport.use(new LocalStrategy({
            usernameField: 'email'
        },
        function(email, password, done) {
            user.findOne({ email: email }, function (err, user) {
                if (err) {
                    return done(err);
                }
                if (!user) {
                    return done(null, false, 'Invalid credentials');
                }

                if (!user.password) {
                    return done(null, false, 'A password hasn\'t been set for this user');
                }

                user.validatePassword(password, function(err, isMatch) {
                    if (err){
                        return done(err);
                    }
                    if(!isMatch){
                        return done(null, false, 'Invalid credentials');
                    }
                    return done(null, user);
                });
            });
        }
    ));
}

function setupOAuth(name, strategy){
    var opts =  {
        clientID: config.auth[name].id,
        clientSecret: config.auth[name].secret,
        callbackURL: config.server.authority + config.auth[name].callback
    };

    setupProvider(strategy, opts, function(accessToken, refreshToken, profile, done) {
        var query = {};
        query[name + 'Id'] = profile.id;
        callback(query, profile, done);
    });
}

function setupOpenId(name, strategy){
    var opts = {
        returnURL: config.server.authority + config.auth[name].callback,
        realm: config.server.authority
    };

    setupProvider(strategy, opts, function(identifier, profile, done) {
        var query = {};
        query[name + 'Id'] = identifier;
        callback(query, profile, done);
    });
}

function setupProvider(type, config, cb){
    passport.use(new type(config, cb));
}

function callback(query, profile, done) {
    var email = profile.emails[0].value;

    user.findOne(query, function (err, document) {
        if(err || document){
            done(err, document);
            return;
        }

        user.findOne({ email: email }, function (err, document) {
            var prop;

            if(err){
                done(err);
                return;
            }

            if(!document){ // register user
                query.email = email;
                query.displayName = profile.displayName;
                document = new user(query);
            }else{ // add provider to user
                for(prop in query){
                    document[prop] = query[prop];
                }

                if(!document.displayName){
                    document.displayName = profile.displayName;
                }
            }

            document.save(done);
        });
    });
}

function configure(done){
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

    setupLocal();
    setupOAuth('facebook', FacebookStrategy);
    setupOAuth('github', GitHubStrategy);
    setupOpenId('google', GoogleStrategy);

    process.nextTick(done);
}

module.exports = {
    configure: configure
};