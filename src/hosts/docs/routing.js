'use strict';

var config = require('../../config'),
    defaults = require('../common/routing.js'),
    sitemapController = require('./controllers/sitemapController.js'),
    opensearchController = require('./controllers/opensearchController.js'),
    viewController = require('./controllers/viewController.js');

function setup(server){
    server.get('/sitemap.xml', sitemapController.getSitemap);
    server.get('/opensearch.xml', opensearchController.getOpensearch);

    defaults.configure(server);

    // views
    server.get('/*', viewController.getDocs);
}

module.exports = {
    setup: setup
};