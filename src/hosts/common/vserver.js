'use strict';

var express = require('express'),
    path = require('path'),
    middleware = require('./middleware.js'),
    config = require('../../config'),
    dev = config.env.development;

function virtualServer(hostname, root){
    var pattern, sanitized, rhost;

    if(hostname !== '*'){ // '*' means any subdomain, even the bare tld.
        pattern = hostname + '.' + config.server.tld;
        sanitized = pattern.replace(/\./g, '\\.').replace(/[*]/g, '(.*?)');
        rhost = new RegExp('^' + sanitized + '$', 'i');
    }

    var vserver = function(req, res, next){
        if (vserver.enabled === false){
            return next();
        }

        if(typeof rhost === 'object'){
            if(!req.headers.host){
                return next();
            }
            var host = req.headers.host.split(':')[0];
            if(!rhost.test(host)){
                return next();
            }
        }

        if (typeof vserver.express === 'function'){
            return vserver.express(req, res, next);
        }
        vserver.express.emit('request', req, res);
    };

    vserver.shutdown = function(){
        vserver.enabled = false;
    };
    vserver.enable = function(){
        vserver.enabled = true;
    };

    vserver.express = instanceServer(vserver, root);

    return vserver;
}

function instanceServer(vserver, root){
    var views = path.join(root, '/views'),
        server = express(); // instance the virtual server

    server.use(function(req, res, next){
        req.vserver = vserver;
        next();
    });

    vserver.setup = function(){
        server.set('views', views);
        server.use(express.logger({
            format: dev ? 'dev' : 'tiny'
        }));

        if (dev){
            server.use(express.errorHandler({
                showStack: true,
                dumpExceptions: true
            }));
        }

        middleware.configure(server);
    };

    return server;
}

module.exports = virtualServer;