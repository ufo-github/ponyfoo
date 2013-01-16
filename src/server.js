var config = require('./config.js'),
    express = require('express'),
    sessionStore = require("connect-mongoose")(express),
    passport = require('passport'),
    assetify = require('node-assetify'),
    assets = require('./assets.js'),
    favicon = assets.source + '/img/favicon.ico',
    server = express();

function configureServer(){
    server.configure(function(){
        configureStatics();

        if (config.env.development){
            server.use(express.logger({ format: 'dev' }));
        }

        configureBody();

        if (config.env.development){
            server.use(express.errorHandler({
                showStack: true,
                dumpExceptions: true
            }));
        }
    });

    configureRouting();
}

function configureStatics(){
    if (config.env.production){
        server.use(express.compress());
    }
    server.use(express.favicon(favicon));
    server.use(express.static(assets.bin));
    server.use(express.static(assets.source + '/pub'));
}

function configureBody(){
    server.use(express.cookieParser());
    server.use(express.bodyParser());

    server.use(express.session({
        secret: config.security.sessionSecret,
        store: new sessionStore()
    }));

    server.use(passport.initialize());
    server.use(passport.session());

    server.use(server.router);
}

function configureRouting(){
    require('./server/authentication.js').configure();
    require('./server/routing.js').map(server);
    require('./server/listen.js').listen(server);
}

assets.appendTo = server.locals;
assetify.use(assetify.plugins.less);

if (config.env.production){
    assetify.use(assetify.plugins.minifyCSS);
    assetify.use(assetify.plugins.minifyJS);
}

assetify.compile(assets, configureServer);