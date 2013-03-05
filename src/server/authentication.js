var passport = require('passport'),
    config = require('../config.js'),
    user = require('../models/user.js'),
    LocalStrategy = require('passport-local').Strategy,
    FacebookStrategy = require('passport-facebook').Strategy,
    GoogleStrategy = require('passport-google').Strategy,
    GitHubStrategy = require('passport-github').Strategy,
    LinkedInStrategy = require('passport-linkedin').Strategy;

function setupLocal(){
    passport.use(new LocalStrategy({
            usernameField: 'email'
        },
        function(email, password, done) {
            user.findOne({ email: email }, function (err, user) {
                if (err) {
                    return done(err);
                }
                if (!user || !user.password) {
                    return done(null, false, 'Invalid login credentials');
                }

                user.validatePassword(password, function(err, isMatch) {
                    if (err){
                        return done(err);
                    }
                    if(!isMatch){
                        return done(null, false, 'Invalid login credentials');
                    }
                    return done(null, user.toObject());
                });
            });
        }
    ));
}

function setupOAuth1(name, strategy, fields){
    if(!config.auth[name].enabled){
        return;
    }
    var opts = {
        consumerKey: config.auth[name].id,
        consumerSecret: config.auth[name].secret,
        callbackURL: config.server.host + config.auth[name].callback,
        profileFields: fields
    };

    setupProvider(strategy, opts, function(token, tokenSecret, profile, done) {
        var query = {};
        query[name + 'Id'] = profile.id;
        callback(query, profile, done);
    });
}

function setupOAuth2(name, strategy){
    if(!config.auth[name].enabled){
        return;
    }

    var opts = {
        clientID: config.auth[name].id,
        clientSecret: config.auth[name].secret,
        callbackURL: config.server.host + config.auth[name].callback
    };

    setupProvider(strategy, opts, function(accessToken, refreshToken, profile, done) {
        var query = {};
        query[name + 'Id'] = profile.id;
        callback(query, profile, done);
    });
}

function setupOpenId(name, strategy){
    var opts = {
        returnURL: config.server.host + config.auth[name].callback,
        realm: config.server.host
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
    var email = profile.emails ? profile.emails[0].value : undefined;
    if(!email){
        done(null,false,'Unable to fetch email address');
        return;
    }

    user.findOne(query, function (err, document) {
        if(err || document){
            done(err, document ? document.toObject() : null);
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

            document.save(function(err, user){
                done(err, user ? user.toObject() : null);
            });
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
            return done(null, user.toObject());
        });
    });

    setupLocal();
    setupOAuth2('facebook', FacebookStrategy);
    setupOAuth2('github', GitHubStrategy);
    setupOpenId('google', GoogleStrategy);
    setupOAuth1('linkedin', LinkedInStrategy, ['id', 'first-name', 'last-name', 'email-address']);

    process.nextTick(done);
}

module.exports = {
    configure: configure
};