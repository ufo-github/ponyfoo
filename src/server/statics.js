'use strict';

var config = require('../config.js'),
    path = require('path'),
    express = require('express'),
    assetify = require('assetify'),
    fingerprint = require('static-asset'),
    favicon = config.statics.faviconSource;

function forcedExpires(req,res,next){ // expires on assets are handled by assetify, images aren't a part of that
    if (req.url.indexOf('/img/') === 0 || req.url === '/favicon.ico') {
        res.setHeader('Cache-Control', 'public, max-age=31535650');
        res.setHeader('Expires', new Date(Date.now() + 31535650000).toUTCString());
    }
    return next();
}

function configure(server){
    server.use(express.compress());
    server.use(forcedExpires);
    server.use(express.favicon(favicon));
    server.use(fingerprint(config.statics.bin));
    server.use(express.static(config.statics.bin));
    server.use(assetify.middleware());
}

module.exports = {
    configure: configure
};