var config = require('./config.js'),
    express = require('express'),
    flash = require('connect-flash'),
    sessionStore = require("connect-mongoose")(express),
    async = require('async'),
    path = require('path'),
    passport = require('passport'),
    assetify = require('assetify'),
    assets = require('./assets.js'),
    favicon = path.join(assets.bin, '/img/favicon.ico'),
    views = path.join(__dirname, '/views'),
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
    server.set('views', views);
    server.locals.settings['x-powered-by'] = false;
    server.locals.config = config;

    server.use(express.cookieParser());
    server.use(express.bodyParser());

    server.use(express.session({
        secret: config.security.sessionSecret,
        store: new sessionStore()
    }));
    configureFlash();

    server.use(passport.initialize());
    server.use(passport.session());

    server.use(server.router);
}

function configureFlash(){
    server.use(flash());
    server.use(function(req,res,next){
        res.locals.flash = {}; // initialize flash

        var render = res.render;
        res.render = function(view, locals, callback){
            res.locals.flash.json = JSON.stringify(res.locals.flash);
            res.render = render;
            res.render(view, locals, callback);
        };
        next();
    })
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
        opensearch = require('./logic/opensearch.js'),
        feed = require('./logic/feed.js'),
        listener = require('./server/listen.js');

    async.series([
        async.apply(db.connect),
        async.apply(compileAndConfigure),
        async.apply(opensearch.output),
        async.apply(feed.rebuild),
        async.apply(listener.listen, server)
    ]);
}

main();