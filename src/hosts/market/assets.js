'use strict';

var config = require('../../config'),
    builder = require('../common/assetDataBuilder.js'),
    data = builder.prepare(__dirname),
    resolve = data.resolveFrontendPath;

data.assets.host = config.server.authorityMarket;

data.assets.css = [
    { folder: resolve('/css/vendor/bootstrap/**/*.less') }
];

// data.assets.jQuery = { version: '1.9.1' };
data.assets.js = [];

module.exports = builder.complete(data);