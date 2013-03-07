var config = require('../config.js'),
    path = require('path'),
    express = require('express'),
    assetify = require('assetify'),
    fingerprint = require('static-asset'),
    assets = require('../assets.js'),
    favicon = path.join(assets.bin, '/img/favicon.ico');

function configure(server){
    if (config.env.production){
        server.use(express.compress());
    }
    server.use(express.favicon(favicon));
    server.use(fingerprint(assets.bin));
    server.use(express.static(assets.bin));
    server.use(assetify.middleware());
}


module.exports = {
    configure: configure
};