'use strict';

function setup(server){
    var config = require('../../../config'),
        defaults = require('../../common/routing.js'),
        auth = require('./auth.js'),
        api = require('./api.js'),
        zombieController = require('../controllers/zombieController.js').configure(server),
        feedController = require('../controllers/feedController.js'),
        sitemapController = require('../controllers/sitemapController.js'),
        opensearchController = require('../controllers/opensearchController.js'),
        blogController = require('../controllers/blogController.js'),
        viewController = require('../controllers/viewController.js');

    server.all('/*', blogController.ensureTakenThenHydrate);

    auth.configure(server); // authentication
    api.configure(server); // rest api
    
    server.get('/rss/latest.xml', feedController.getFeed);
    server.get('/sitemap.xml', sitemapController.getSitemap);
    server.get('/opensearch.xml', opensearchController.getOpensearch);

    defaults.configure(server);

    server.get('/*', zombieController.crawlerInterceptor); // GET catch-all for web crawlers
    server.get('/*', viewController.getView); // GET catch-all, views
}

module.exports = {
    setup: setup
};