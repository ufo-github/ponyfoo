'use strict';

function setup(server){
    var config = require('../../../config'),
        defaults = require('../../common/routing.js'),
        authentication = require('./authentication.js'),
        user = require('./user.js'),
        subscription = require('./subscription.js'),
        api = require('./api.js'),
        zombieController = require('../controllers/zombieController.js').configure(server),
        feedController = require('../controllers/feedController.js'),
        sitemapController = require('../controllers/sitemapController.js'),
        opensearchController = require('../controllers/opensearchController.js'),
        pingbackController = require('../controllers/pingbackController.js'),
        blogController = require('../controllers/blogController.js'),
        viewController = require('../controllers/viewController.js');

    server.all('/*', blogController.ensureTakenThenHydrate);

    authentication.configure(server); // user authentication
    user.configure(server); // user services
    subscription.configure(server); // email subscriptions
    api.configure(server); // rest api
    
    server.get('/rss/latest.xml', feedController.getFeed);
    server.get('/sitemap.xml', sitemapController.getSitemap);
    server.get('/opensearch.xml', opensearchController.getOpensearch);
    server.use(config.blog.pingback, pingbackController.receive);

    defaults.configure(server);

    server.get('/*', zombieController.crawlerInterceptor); // GET catch-all for web crawlers
    server.get('/*', viewController.getView); // GET catch-all, views
}

module.exports = {
    setup: setup
};