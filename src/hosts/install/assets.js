'use strict';

var configuration = require('../common/assets.js').configure(__dirname),
    path = require('path'),
    absolute = path.join(process.cwd(), '/src/frontend/less'),
    shared = path.relative(configuration.assets.source, absolute);

configuration.assets.css = [
    shared + '/defaults/reset.css',/*
    '/css/defaults/basic.less',
    '/css/defaults/elements.less',
    '/css/defaults/controls.less',
    '/css/defaults/controls.spinner.less',
    '/css/defaults/layout.less',
    '/css/defaults/design.less',
    '/css/defaults/sprite.less',
    '/css/vendor/markdown.less',*/
    '/css/views/home/index.less'
];

// configuration.assets.host = '';

module.exports = configuration;