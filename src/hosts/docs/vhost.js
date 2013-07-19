'use strict';

var express = require('express'),
    path = require('path'),
    assetify = require('assetify').instance(),
    config = require('../../config');

module.exports = {
    setup: function(){
        var factory = require('../common/vserver.js'),
            vserver = factory(config.server.slug.docs, __dirname),
            routing = require('./routing'),
            bin = config.statics.bin(__dirname),
            gen = path.join(__dirname, '.bin');

        vserver.express.use(express['static'](gen));
        assetify(vserver.express, express, bin);

        vserver.setup();
        routing.setup(vserver.express);

        return vserver; // expose the middleware
    }
};