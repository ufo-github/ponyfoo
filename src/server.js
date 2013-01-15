var config = require('./config.js'),
    express = require('express'),
    sessionStore = require("connect-mongoose")(express),
    passport = require('passport'),
    assetify = require('node-assetify'),
    views = __dirname + '/views',
    assets = __dirname + '/static',
    assetsBin = assets + '/bin',
    favicon = assets + '/img/favicon.ico',
    server = express();

// TODO: remove less = require('less-middleware'),
// TODO rm server.use(less({ src: assets, paths: [__dirname] }));

assetify.publish({
    in: assets,
    out: assetsBin,
    css: [
        '/css/defaults/reset.css',
        '/css/defaults/elements.css',
        '/css/defaults/controls.css',
        '/css/defaults/layout.css',
        '/css/defaults/design.css',
        '/css/libs/markdown.css',
        '/css/libs/prettify.css',
        '/css/libs/pikaday.css',
        { profile: 'author', local: '/css/layouts/author.css' },
        '/css/views/main/entries.css',
        { profile: 'anon', local: '/css/views/user/register.css' },
        { profile: 'anon', local: '/js/views/user/login.css' },
        { profile: 'author', local: '/css/views/author/editor.css' },
        { profile: 'author', local: '/css/views/author/review.css' }
    ],
    js: [
        assetify.jQuery('1.8.3', '/js/jquery-1.8.3.min.js'),
        '/js/libs/moment.min.js',
        '/js/libs/mustache.js',
        '/js/libs/jquery.textarearesizer.min.js',
        '/js/libs/Markdown.Converter.js',
        '/js/libs/Markdown.Sanitizer.js',
        '/js/libs/Markdown.Editor.js',
        '/js/libs/prettify.js',
        '/js/libs/jquery.pikaday.js',
        '/js/ext/prettify.extensions.js',
        '/js/nbrut/nbrut.extensions.js',
        '/js/nbrut/nbrut.core.js',
        '/js/nbrut/nbrut.md.js',
        '/js/nbrut/nbrut.ui.js',
        '/js/nbrut/nbrut.templates.js',
        '/js/nbrut/nbrut.thin.js',
        '/js/nbrut/nbrut.init.js',
        '/js/views/thin.hooks.js',
        '/js/views/templates.js',
        { profile: 'anon', local: '/js/views/templates.anon.js' },
        { profile: 'author', local: '/js/views/templates.author.js'},
        '/js/views/main/entries.js',
        '/js/views/main/entry.js',
        { profile: 'author', local: '/js/views/author/editor.js' },
        { profile: 'author', local: '/js/views/author/review.js' }
    ],
    appendTo: server.locals
});

server.configure(function(){
    var dev = config.env.development,
        prod = config.env.production;

    if (prod){
        server.use(express.compress());
    }

    server.set('views', views);
    server.use(express.favicon(favicon));

    server.use(express.static(assetsBin));

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