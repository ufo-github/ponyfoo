'use strict';

var util = require('util'),
    config = require('../../config'),
    builder = require('../common/assetDataBuilder.js'),
    data = builder.prepare(__dirname),
    resolve = data.resolveFrontendPath;

data.assets.host = config.server.authorityDocs;

data.assets.css = [
    '/css/flatstrap.less',
    '/css/angular-animations.less',
    resolve('/css/vendor/highlight.less'),
    '/css/footer.less',
    '/css/docs.less'
];

function cdn(pkg, goog, v){
    var version = v || '1.1.4',
        ext = config.env.development ? '.js' : '.min.js',
        base = goog !== false ? 
            '//ajax.googleapis.com/ajax/libs/angularjs/' :
            'http://code.angularjs.org/';

    return { ext: base + version + '/' + pkg + ext };
}

data.assets.js = [
    cdn('angular'),
    cdn('angular-bootstrap', false),
    cdn('angular-bootstrap-prettify', false),
    resolve('/js/social/twitter.js'),
    '../.bin/pages.js',
    '/js/app.js'
];

module.exports = builder.complete(data);