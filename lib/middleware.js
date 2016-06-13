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
var csp = require('helmet-csp');
var frameguard = require('frameguard');
var xssFilter = require('x-xss-protection');
var env = require('./env');
var redis = require('./redis');
var authentication = require('./authentication');
var authority = env('AUTHORITY');
var cookieSecret = env('COOKIE_SECRET');
var sessionSecret = env('SESSION_SECRET');
var reportUri = authority + '/api/csp-report';
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
  app.use(bodyParser.json({ limit: '5mb' }));
  app.use(bodyParser.urlencoded({ limit: '5mb', extended: false }));
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
  app.use(csp({
    reportUri: reportUri,
    reportOnly: true
  }));
  app.use(frameguard('sameorigin'));
  app.use(xssFilter());

  authentication.initialize();
};
