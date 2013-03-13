'use strict';

var config = require('../config.js'),
    path = require('path'),
    views = path.join(__dirname, '../views'),
    express = require('express'),
    sessionStore = require("connect-mongoose")(express),
    flash = require('./flash.js'),
    passport = require('passport');

function configure(server){
    server.set('views', views);
    server.locals.settings['x-powered-by'] = false;
    server.locals.config = config;

    server.use(express.cookieParser());
    server.use(express.bodyParser());

    server.use(express.session({
        secret: config.security.sessionSecret,
        store: new sessionStore()
    }));
    flash.configure(server);

    server.use(passport.initialize());
    server.use(passport.session());

    server.use(function(req,res,next){
        res.locals.user = req.user;
        next();
    });

    server.use(server.router);
}

module.exports = {
    configure: configure
};