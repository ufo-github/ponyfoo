var config = require('./config.js'),
    express = require('express'),
    sessionStore = require("connect-mongoose")(express),
    async = require('async'),
    passport = require('passport'),
    assetify = require('assetify'),
    assets = require('./assets.js'),
    favicon = assets.bin + '/img/favicon.ico',
    views = __dirname + '/views',
    server = express();

function compileAssets(done){
    assetify.use(assetify.plugins.less);
    assetify.use(assetify.plugins.jsn);

    if (config.env.production){
        assetify.use(assetify.plugins.bundle);
        assetify.use(assetify.plugins.minifyCSS);
        assetify.use(assetify.plugins.minifyJS);
    }
    assetify.use(assetify.plugins.forward());
    assetify.compile(assets, done);
}

function configureServer(done){
    server.configure(function(){
        configureStatic();

        if (config.env.development){
            server.use(express.logger({ format: 'dev' }));
        }

        configureMiddleware();

        if (config.env.development){
            server.use(express.errorHandler({
                showStack: true,
                dumpExceptions: true
            }));
        }
    });

    process.nextTick(done);
}

function configureStatic(){
    if (config.env.production){
        server.use(express.compress());
    }
    server.use(express.favicon(favicon));
    server.use(express.static(assets.bin));
    server.use(assetify.middleware());
}

function configureMiddleware(){
    server.locals.config = config;
    server.set('views', views);

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

function configureServerRouting(done){
    var authentication = require('./server/authentication.js'),
        routing = require('./server/routing.js');

    async.series([
        configureServer,
        async.apply(authentication.configure),
        async.apply(routing.map, server)
    ],done);
}

function compileAndConfigure(done){
    async.parallel([
        compileAssets,
        configureServerRouting
    ],done);
}


function main(){
    var db = require('./server/db.js'),
        feed = require('./logic/feed.js'),
        listener = require('./server/listen.js');

    async.series([
        async.apply(db.connect),
        async.apply(compileAndConfigure),
        async.apply(feed.rebuild),
        async.apply(listener.listen, server)
    ]);
}

main();