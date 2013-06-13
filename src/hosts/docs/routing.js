'use strict';

var config = require('../../config'),
    defaults = require('../common/routing.js'),
    sitemapController = require('./controllers/sitemapController.js'),
    opensearchController = require('./controllers/opensearchController.js'),
    homeController = require('./controllers/homeController.js');

function setup(server){
    
    // views
    server.get('/', homeController.getIndex);

    server.get('/sitemap.xml', sitemapController.getSitemap);
    server.get('/opensearch.xml', opensearchController.getOpensearch);

    defaults.configure(server);
    
    server.get('/*', function(req, res){
        res.redirect('/');
    });
}

module.exports = {
    setup: setup
};