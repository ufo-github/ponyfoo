'use strict';

var express = require('express');

module.exports = {
    using: function(vars){
        var factory = require('../common/vserver.js'),
            vserver = factory('*', __dirname),
            routing = require('./routing');

        vars.assetifySetup(vserver.express, express);
        vserver.setup();
        routing.setup(vserver.express);

        return vserver; // expose the middleware
    }
};