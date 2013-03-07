var config = require('../config.js'),
    path = require('path'),
    express = require('express'),
    assetify = require('assetify'),
    fingerprint = require('static-asset'),
    assets = require('../assets.js'),
    favicon = config.static.faviconSource;

function assetExpires(req,res,next){
    if (req.url.indexOf('/img/') === 0 || req.url === '/favicon.ico') {
        res.setHeader('Cache-Control', 'public, max-age=31535650');
        res.setHeader('Expires', new Date(Date.now() + 31535650000).toUTCString());
    }
    return next();
}

function configure(server){
    server.use(express.compress());
    server.use(assetExpires);
    server.use(express.favicon(favicon));
    server.use(fingerprint(assets.bin));
    server.use(express.static(assets.bin));
    server.use(assetify.middleware());
}

module.exports = {
    configure: configure
};