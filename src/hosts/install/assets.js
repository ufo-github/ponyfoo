'use strict';

var them = require('../common/assets.js').configure(__dirname),
    path = require('path'),
    absolute = path.join(process.cwd(), '/src/frontend/less'),
    shared = path.relative(them.assets.source, absolute);

them.assets.css = [
    shared + '/defaults/reset.css',
    shared + '/css/defaults/basic.less',
    shared + '/css/defaults/elements.less',
    shared + '/css/defaults/controls.less',
    shared + '/css/defaults/controls.spinner.less',
    shared + '/css/defaults/layout.less',
    shared + '/css/defaults/design.less',
    shared + '/css/defaults/sprite.less',
    shared + '/css/vendor/markdown.less',
    '/css/views/home/index.less'
];

// them.assets.host = '';

module.exports = them;