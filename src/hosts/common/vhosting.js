'use strict';

var express = require('express'),
    middleware = require('./middleware.js'),
    config = require('../config.js'),
    dev = config.env.development;

function vhosted(hostname, vhost){
    var pattern = hostname + '.' + config.server.tld,
        rhost = new RegExp('^' + pattern.replace(/[*]/g, '(.*?)') + '$', 'i');

    var bridge = function(req, res, next){
        if (!middleware.vhost){
            return next();
        }

        if(rhost){
            if(!req.headers.host){
                return next();
            }
            var host = req.headers.host.split(':')[0];
            if(!rhost.test(host)){
                return next();
            }
        }

        if (typeof bridge.vhost === 'function'){
            return bridge.vhost(req, res, next);
        }
        bridge.vhost.emit('request', req, res);
    };

    bridge.vhost = vhost;
    bridge.stop = function(){
        bridge.vhost = null;
    };
    bridge.configure = function(views){
        configure(bridge.vhost, views);
    }
    // TODO add middleware to vhost so that you
    // can .stop from within requests
    return bridge;
}

function configure(vhost, views){
    vhost.set('views', views);
    vhost.use(express.logger({
        format: dev ? 'dev' : 'tiny'
    }));

    if (dev){
        vhost.use(express.errorHandler({
            showStack: true,
            dumpExceptions: true
        }));
    }

    middleware.configure(vhost);
}

module.exports = vhosted;