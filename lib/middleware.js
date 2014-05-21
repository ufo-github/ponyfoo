'use strict';

var session = require('express-session');
var passport = require('passport');
var mongoose = require('mongoose');
var MongoStore = require('connect-mongo')(session);
var env = require('./env');
var authenticationService = require('../services/authentication');

module.exports = function (app) {
  app.use(session({
    name: 'sid',
    secret: env('SESSION_SECRET'),
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 12 }, // a year
    store: new MongoStore({
      mongoose_connection: mongoose.connections[0]
    })
  }));

  app.use(passport.initialize());
  app.use(passport.session());

  authenticationService.configure();
}
