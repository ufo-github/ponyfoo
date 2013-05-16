'use strict';

var configuration = require('../common/assets.js').configure(__dirname);

configuration.assets.css = [/*
    '/css/defaults/elements.less',
    '/css/defaults/controls.less',
    '/css/defaults/controls.spinner.less',
    '/css/defaults/layout.less',
    '/css/defaults/design.less',
    '/css/defaults/sprite.less',
    '/css/vendor/markdown.less',*/
    '/css/availability.less'
];

// configuration.assets.profiles: ['anon', 'connected'];
// configuration.assets.host = '';

module.exports = configuration;