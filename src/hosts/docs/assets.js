'use strict';

var config = require('../../config'),
    builder = require('../common/assetDataBuilder.js'),
    data = builder.prepare(__dirname),
    resolve = data.resolveFrontendPath;

data.assets.host = config.server.authorityDocs;

data.assets.css = [
    '/css/flatstrap.less',
    '/css/docs.less'
];

function angular(scriptName, googleCdn){
    var version = '1.1.4',
        distro = config.env.development ? '.js' : '.min.js',
        base = googleCdn !== false ? '//ajax.googleapis.com/ajax/libs/angularjs/' : 'http://code.angularjs.org/';

    return {
        ext: base + version + '/' + scriptName + distro
    };
}

data.assets.jQuery = { version: '1.9.1' };
data.assets.js = [
    angular('angular'),
    angular('angular-resource'),
    angular('angular-cookies'),
    angular('angular-sanitize'),
    angular('angular-mobile'),
    angular('angular-bootstrap', false),
    angular('angular-bootstrap-prettify', false),
    '/js/app.js'
];

module.exports = builder.complete(data);