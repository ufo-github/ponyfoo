'use strict';

var express = require('express');

module.exports = {
    using: function(opts){
        var vserver = require('../common/vserver.js'),
            server = vserver('www', __dirname),
            routing = require('./routing.js');

        opts.assetify.configure(server, express);
        routing.setup(server.express);

        return server; // expose the middleware
    }
};