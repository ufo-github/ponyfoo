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

module.exports = {
    grunt: {
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
    jQuery: path.join(config.statics.folder, '/js/vendor/jquery-' + assets.jQuery.version + '.js')
};
