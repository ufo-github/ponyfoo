'use strict';

var express = require('express'),
    middleware = require('./middleware.js'),
    config = require('../config.js'),
    dev = config.env.development;

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

    done();
}

module.exports = {
    configure: configure
};