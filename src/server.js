var express = require('express'),
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

    server.use(less({ src: assets }));
    server.use(express.static(assets));

    server.use(express.logger({ format: 'dev' }));

    server.use(express.bodyParser());
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