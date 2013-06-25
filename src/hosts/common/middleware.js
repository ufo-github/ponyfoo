'use strict';

var config = require('../../config'),
    express = require('express'),
    sessionStore = require('connect-mongoose')(express),
    flash = require('./flash.js'),
    passport = require('passport'),
    cors = require('cors'),
    authenticationService = require('../../service/authenticationService.js'),
    platformService = require('../../service/platformService.js');

function configure(server){
    server.locals.basedir = process.cwd();
    server.locals.settings['x-powered-by'] = false;
    server.locals.config = config;

    server.use(express.cookieParser());
    server.use(express.bodyParser());

    server.use(express.session({
        cookie: {
            path: '/',
            domain: config.server.tld
        },
        secret: config.security.sessionSecret,
        store: new sessionStore()
    }));

    server.use(cors({
        origin: true,
        credentials: true        
    }));

    server.use(function(req,res,next){
        if(!!res.header('Access-Control-Allow-Methods')){
            console.log(JSON.stringify(req.headers || {empty:true}));
            console.log('\n');
            console.log(JSON.stringify(res.headers || {empty:true}));
        }
        next();
    });

    flash.configure(server);

    authenticationSetup(server);
    localsSetup(server);

    server.use(server.router);
}

function authenticationSetup(server){
    server.use(passport.initialize());
    server.use(passport.session());

    authenticationService.configure();
}

function localsSetup(server){
    server.use(function(req,res,next){
        platformService.hydrate(req);

        res.locals.user = req.user;
        res.locals.query = req.query;
        res.locals.slug = req.slug;
        next();
    });
}

module.exports = {
    configure: configure
};