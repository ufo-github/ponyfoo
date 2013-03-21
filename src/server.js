'use strict';

var config = require('./config.js'),
    express = require('express'),
    middleware = require('./server/middleware.js'),
    async = require('async'),
    path = require('path'),
    relic = require('./server/newrelic.js'),
    server = express();

function configureServer(opts, done){
    server.configure(function(){
        opts.assetify.useBy(server, express);

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

        process.nextTick(done);
    });
}

function configureRouter(opts, done){
    var authentication = require('./server/authentication.js'),
        routing = require('./server/routing.js');

    async.series([
        async.apply(configureServer, opts),
        async.apply(authentication.configure),
        async.apply(routing.map, server)
    ],done);
}

function execute(opts, done){
    relic.init();

    var db = require('./server/db.js'),
        listener = require('./server/listen.js');

    async.series([
        async.apply(db.connect),
        async.apply(configureRouter, opts),
        async.apply(listener.listen, server)
    ], function(){
        server.on('close', done);
    });
}

module.exports = {
    execute: execute
};
