'use strict';

var express = require('express'),
    assetify = require('assetify').instance(),
    config = require('../../config');

module.exports = {
    setup: function(){
        var factory = require('../common/vserver.js'),
            vserver = factory('*', __dirname),
            routing = require('./routing'),
            bin = config.statics.bin(__dirname);

        assetify(vserver.express, express, bin);

        vserver.setup();
        routing.setup(vserver.express);

        return vserver; // expose the middleware
    }
};