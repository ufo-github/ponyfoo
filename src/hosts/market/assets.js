'use strict';

var config = require('../../config'),
    builder = require('../common/assetDataBuilder.js'),
    data = builder.prepare(__dirname),
    resolve = data.resolveFrontendPath;

data.assets.host = config.server2.authorityLanding;

data.assets.css = [
    resolve('/css/defaults/reset.css'),
    resolve('/css/defaults/basic.less'),
    resolve('/css/vendor/hint.less'),
    '/css/defaults.less',
    '/css/sprite.less',
    '/css/controls.less',
    '/css/layout.less',
    '/css/navigation-layout.less',
    '/css/navigation.less',
    '/css/availability.less',
    '/css/features.less',
    '/css/design.less'
];

data.assets.js = [
    resolve('/js/ext/jquery.layout.js'),
    '/js/navigation.js',
    '/js/registration.js'
];

data.jQuery = builder.jQuery();

module.exports = builder.complete(data);