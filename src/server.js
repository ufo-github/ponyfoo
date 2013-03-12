var config = require('./config.js'),
    express = require('express'),
    statics = require('./server/statics.js'),
    middleware = require('./server/middleware.js'),
    libraries = require('./server/libraries.js'),
    async = require('async'),
    path = require('path'),
    assets = require('./assets.js'),
    relic = require('./server/newrelic.js'),
    server = express();

function main(){
    relic.init();

    var db = require('./server/db.js'),
        listener = require('./server/listen.js');

    async.series([
        async.apply(db.connect),
        async.apply(compileAndConfigure),
        async.apply(listener.listen, server)
    ]);
}

function compileAndConfigure(done){
    async.parallel([
        assets.compile,
        libraries.configure,
        configure
    ],done);
}

function configure(done){
    var authentication = require('./server/authentication.js'),
        routing = require('./server/routing.js');

    async.series([
        configureServer,
        async.apply(authentication.configure),
        async.apply(routing.map, server)
    ],done);
}

function configureServer(done){
    server.configure(function(){
        statics.configure(server);

        if (config.env.development){
            server.use(express.logger({ format: 'dev' }));
        }

        middleware.configure(server);

        if (config.env.development){
            server.use(express.errorHandler({
                showStack: true,
                dumpExceptions: true
            }));
        }
    });

    process.nextTick(done);
}

main();