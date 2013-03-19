'use strict';

var config = require('./../../config.js'),
    assetify = require('assetify'),
    common = require('./common.js'),
    css = require('./css-assets.js'),
    js = require('./js-assets.js');

var assets = {
    source: config.statics.folder,
    bin: config.statics.bin,
    css: css.assets,
    js: js.assets,
    jQuery: js.jQuery,
    host: config.server.host,
    profiles: common.profiles,
    compile: compile
};

function compile(done){
    assetify.use(assetify.plugins.less);
    assetify.use(assetify.plugins.jsn);

    if (config.env.production){
        assetify.use(assetify.plugins.bundle);
        assetify.use(assetify.plugins.minifyCSS);
        assetify.use(assetify.plugins.minifyJS);
    }
    assetify.use(assetify.plugins.forward({ extnames: ['.txt'] }, true));
    assetify.use(assetify.plugins.fingerprint);
    assetify.compile(assets, done);
}

module.exports = assets;