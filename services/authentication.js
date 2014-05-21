'use strict';

var passport = require('passport'),
  config = require('../config'),
  User = require('../model/User.js'),
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
      User.findOne({ email: email }, function (err, user) {
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

function setupOAuth1(name, Strategy, fields){
  if(!config.auth[name].enabled){
    return;
  }
  var opts = {
    consumerKey: config.auth[name].id,
    consumerSecret: config.auth[name].secret,
    callbackURL: config.server.authorityBlog + config.auth[name].callback,
    profileFields: fields
  };

  setupProvider(Strategy, opts, function(token, tokenSecret, profile, done) {
    var query = {};
    query[name + 'Id'] = profile.id;
    callback(query, profile, done);
  });
}

function setupOAuth2(name, Strategy){
  if(!config.auth[name].enabled){
    return;
  }

  var opts = {
    clientID: config.auth[name].id,
    clientSecret: config.auth[name].secret,
    callbackURL: config.server.authorityBlog + config.auth[name].callback
  };

  setupProvider(Strategy, opts, function(accessToken, refreshToken, profile, done) {
    var query = {};
    query[name + 'Id'] = profile.id;
    callback(query, profile, done);
  });
}

function setupOpenId(name, Strategy){
  var opts = {
    returnURL: config.server.authorityBlog + config.auth[name].callback,
    realm: config.server.authorityBlog
  };

  setupProvider(Strategy, opts, function(identifier, profile, done) {
    var query = {};
    query[name + 'Id'] = identifier;
    callback(query, profile, done);
  });
}

function setupProvider(Strategy, config, cb){
  passport.use(new Strategy(config, cb));
}

function callback(query, profile, done) {
  var email = profile.emails ? profile.emails[0].value : undefined;
  if(!email){
    return done(null,false,'Unable to fetch email address');
  }

  User.findOne(query, function (err, user) {
    if(err || user){
      return done(err, user ? user.toObject() : null);
    }

    User.findOne({ email: email }, function (err, user) {
      var prop;

      if(err){
        return done(err);
      }

      if(!user){ // register user
        query.email = email;
        query.displayName = profile.displayName;
        user = new User(query);
      }else{ // add provider to user
        for(prop in query){
          user[prop] = query[prop];
        }

        if(!user.displayName){
          user.displayName = profile.displayName;
        }
      }

      user.save(function(err, user){
        done(err, user ? user.toObject() : null);
      });
    });
  });
}

function configure(){
  passport.serializeUser(function(user, done) {
    done(null, user._id);
  });

  passport.deserializeUser(function(id, done) {
    User.findOne({ _id: id }, function (err, user) {
      done(err, user ? user.toObject() : null);
    });
  });

  setupLocal();
  setupOAuth2('facebook', FacebookStrategy);
  setupOAuth2('github', GitHubStrategy);
  setupOpenId('google', GoogleStrategy);
  setupOAuth1('linkedin', LinkedInStrategy, ['id', 'first-name', 'last-name', 'email-address']);
}

module.exports = {
  configure: configure
};
