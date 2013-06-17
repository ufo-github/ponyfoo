'use strict';

var express = require('express'),
    config = require('../../config'),
    generated = __dirname + '/.bin';

module.exports = {
    using: function(vars){
        var factory = require('../common/vserver.js'),
            vserver = factory(config.server.slug.docs, __dirname),
            routing = require('./routing.js');

        vserver.express.use(express['static'](generated));
        vars.assetifySetup(vserver.express, express);
        vserver.setup();
        routing.setup(vserver.express);

        return vserver; // expose the middleware
    }
};