'use strict';

var mongoose = require('mongoose');
var multer  = require('multer');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var flash = require('connect-flash');
var compression = require('compression');
var passport = require('passport');
var MongoStore = require('connect-mongo')(session);
var RedisStore = require('connect-redis')(session);
var env = require('./env');
var cookieSecret = env('COOKIE_SECRET');
var sessionSecret = env('SESSION_SECRET');
var redis = require('./redis');
var authentication = require('./authentication');
var year = 1000 * 60 * 60 * 24 * 12;

function sessionStore () {
  return redis.enabled ? usingRedis() : usingMongo();

  function usingRedis () {
    return new RedisStore({
      client: redis.pub,
      ttl: year,
      prefix: 'sid:'
    });
  }
  function usingMongo () {
    return new MongoStore({
      mongooseConnection: mongoose.connection,
      autoReconnect: true
    });
  }
}

module.exports = function (app) {
  app.use(compression());
  app.use(multer());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(cookieParser(cookieSecret));
  app.use(session({
    name: 'sid',
    secret: sessionSecret,
    cookie: { maxAge: year },
    store: sessionStore(),
    resave: true,
    saveUninitialized: true
  }));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(flash());

  authentication.initialize();
};
