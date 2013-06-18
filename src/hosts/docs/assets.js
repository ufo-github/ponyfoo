'use strict';

var config = require('../../config'),
    builder = require('../common/assetDataBuilder.js'),
    data = builder.prepare(__dirname),
    resolve = data.resolveLocalPath;

data.assets.host = config.server.authorityDocs;

data.assets.css = [
    '/css/flatstrap.less',
    '/css/angular-animations.less',
    '/css/footer.less',
    '/css/docs.less'
];

data.assets.js = [
    '/js/vendor/angular.min.js',
    '/js/vendor/angular-bootstrap.min.js',
    '/js/vendor/angular-bootstrap-prettify.min.js',
    '../.bin/pages.js',
    '/js/app.js',
    '/js/twitter.js'
];

module.exports = builder.complete(data);