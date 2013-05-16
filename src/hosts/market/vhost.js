'use strict';

module.exports = {
    using: function(opts){
        var vserver = require('../common/vserver.js'),
            server = vserver('www', __dirname);

        return server; // expose the middleware
    }
};