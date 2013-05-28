'use strict';

var config = require('../../config'),
    builder = require('../common/assetDataBuilder.js'),
    data = builder.prepare(__dirname),
    resolve = data.resolveFrontendPath;

data.assets.host = config.server.authorityLanding;

data.assets.css = [
    resolve('/css/defaults/reset.css'),
    resolve('/css/defaults/basic.less'),
    resolve('/css/defaults/elements.less'),
    resolve('/css/defaults/controls.less'),
    resolve('/css/defaults/controls.spinner.less'),
    resolve('/css/defaults/layout.less'),
    resolve('/css/defaults/design.less'),
    resolve('/css/defaults/sprite.less'),
    resolve('/css/vendor/markdown.less'),
    resolve('/css/vendor/hint.less'),    
    '/css/views/home/index.less'
];

module.exports = builder.complete(data);