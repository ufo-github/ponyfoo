var config = require('./config.js'),
    express = require('express'),
    sessionStore = require("connect-mongoose")(express),
    passport = require('passport'),
    assetify = require('node-assetify'),
    assets = require('./assets.js'),
    views = __dirname + '/views',
    favicon = assets.source + '/img/favicon.ico',
    server = express();

assets.appendTo = server.locals;
assetify.publish(assets);

server.configure(function(){
    var dev = config.env.development,
        prod = config.env.production;

    if (prod){
        server.use(express.compress());
    }

    server.set('views', views);
    server.use(express.favicon(favicon));

    server.use(express.static(assets.bin));

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