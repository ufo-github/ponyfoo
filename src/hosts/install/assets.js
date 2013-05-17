'use strict';

var config = require('../../config'),
    them = require('../common/assets.js').configure(__dirname),
    path = require('path'),
    absolute = path.join(process.cwd(), '/src/frontend/less'),
    shared = path.relative(them.assets.source, absolute);

them.assets.css = [
    path.join(shared, '/defaults/reset.css'),
    path.join(shared, '/defaults/basic.less'),
    path.join(shared, '/defaults/elements.less'),
    path.join(shared, '/defaults/controls.less'),
    path.join(shared, '/defaults/controls.spinner.less'),
    path.join(shared, '/defaults/layout.less'),
    path.join(shared, '/defaults/design.less'),
    path.join(shared, '/defaults/sprite.less'),
    path.join(shared, '/vendor/markdown.less'),
    '/css/views/home/index.less'
];

them.assets.host = config.server2.authorityLanding;

module.exports = them;