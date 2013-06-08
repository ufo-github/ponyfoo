'use strict';

var config = require('../../config'),
    builder = require('../common/assetDataBuilder.js'),
    data = builder.prepare(__dirname),
    resolve = data.resolveFrontendPath;

data.assets.host = config.server.authorityMarket;

data.assets.css = [
    '/css/vendor/flatstrap/bootstrap.less',
    '/css/vendor/flatstrap/responsive.less',
    resolve('/css/youtube.less'),
    '/css/views/home/index.less'
];

data.assets.jQuery = { version: '1.9.1' };
data.assets.js = [
    '/js/views/home/index.js'
];

module.exports = builder.complete(data);