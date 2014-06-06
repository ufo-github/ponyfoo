'use strict';

var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var passport = require('passport');
var MongoStore = require('connect-mongo')(session);
var env = require('./env');
var db = require('./db');
var cookieSecret = env('COOKIE_SECRET');
var sessionSecret = env('SESSION_SECRET');
var authenticationService = require('../services/authentication');
var year = 1000 * 60 * 60 * 24 * 12;

module.exports = function (app) {
  app.use(bodyParser());
  app.use(cookieParser(cookieSecret));

  app.use(session({
    name: 'sid',
    secret: sessionSecret,
    cookie: { maxAge: year },
    store: new MongoStore({ mongoose_connection: db.connection })
  }));

  app.use(passport.initialize());
  app.use(passport.session());

  authenticationService.initialize();
};
