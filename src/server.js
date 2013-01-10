var config = require('./config.js'),
    express = require('express'),
    passport = require('passport'),
    less = require('less-middleware'),
    views = __dirname + '/views',
    assets = __dirname + '/static',
    favicon = assets + '/img/favicon.ico',
    server = express();

server.configure('production', function(){
    server.use(express.compress());
});

server.configure(function(){
    server.set('views', views);
    server.use(express.favicon(favicon));

    server.use(less({ src: assets, paths: [__dirname] }));
    server.use(express.static(assets));

    server.use(express.logger({ format: 'dev' }));

    server.use(express.bodyParser());

    server.use(express.session({ secret: config.server.sessionSecret }));
    server.use(passport.initialize());
    server.use(passport.session());

    server.use(server.router);
});

server.configure('development', function(){
    server.use(express.errorHandler({
        showStack: true,
        dumpExceptions: true
    }));
});

require('./server/routing.js')(server);
require('./server/listen.js')(server);