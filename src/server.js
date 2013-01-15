var config = require('./config.js'),
    express = require('express'),
    sessionStore = require("connect-mongoose")(express),
    passport = require('passport'),
    less = require('less-middleware'),
    assetify = require('node-assetify'),
    views = __dirname + '/views',
    assets = __dirname + '/static',
    favicon = assets + '/img/favicon.ico',
    server = express();

server.configure(function(){
    var dev = config.env.development,
        prod = config.env.production;

    if (prod){
        server.use(express.compress());
    }

    server.set('views', views);
    server.use(express.favicon(favicon));

    server.use(less({ src: assets, paths: [__dirname] }));
    server.use(express.static(assets));

    if (dev){
        server.use(express.logger({ format: 'dev' }));
    }

    server.use(express.cookieParser());
    server.use(express.bodyParser());

    server.use(express.session({
        secret: config.security.sessionSecret,
        store: new sessionStore()
    }));

    server.use(passport.initialize());
    server.use(passport.session());

    server.use(server.router);

    if (dev){
        server.use(express.errorHandler({
            showStack: true,
            dumpExceptions: true
        }));
    }
});

require('./server/authentication.js').configure();
require('./server/routing.js').map(server);
require('./server/listen.js').listen(server);