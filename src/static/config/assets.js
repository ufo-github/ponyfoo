'use strict';

var config = require('./../../config.js'),
    common = require('./common.js'),
    css = require('./css-assets.js'),
    js = require('./js-assets.js'),
    path = require('path');

var assets = {
    favicon: config.statics.faviconSource,
    source: config.statics.folder,
    bin: config.statics.bin,
    css: css.assets,
    js: js.assets,
    jQuery: {
        version: '1.9.1'
    },
    host: config.server.host,
    profiles: common.profiles
};

// absolute path used to load jQuery locally
var jQueryAbsolute = path.join(config.statics.folder, '/js/vendor/jquery-' + assets.jQuery.version + '.min.js');

module.exports = {
    grunt: {
        production: config.env.production,
        assets: assets,
        plugins: {
            jsn: true,
            forward: [{ extnames: ['.txt'] }, true]
        },
        caching: {
            expiresHeader: function(req){
                return req.url.indexOf('/img/') === 0;
            }
        }
    },
    jQuery: jQueryAbsolute
};
