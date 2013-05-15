'use strict';

var config = require('../../config.js'),
    path = require('path');

module.exports = {
    configure: function(base){
        return {
            production: config.env.production,
            assets:  {
                favicon: config.statics.faviconSource,
                source: config.statics.folder(base),
                bin: config.statics.bin(base)
            },
            plugins: {
                jsn: true,
                forward: [{ extnames: ['.txt'] }, true]
            },
            caching: {
                expiresHeader: function(req){
                    return req.url.indexOf('/img/') === 0;
                }
            }
        };
    }
};
