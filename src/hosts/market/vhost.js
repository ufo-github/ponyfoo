'use strict';

var express = require('express'),
    config = require('../../config');

module.exports = {
    using: function(vars){
        var factory = require('../common/vserver.js'),
            vserver = factory(config.server2.slug.market, __dirname),
            routing = require('./routing.js');

        vars.assetifySetup(vserver.express, express);
        vserver.setup();
        routing.setup(vserver.express);

        return vserver; // expose the middleware
    }
};