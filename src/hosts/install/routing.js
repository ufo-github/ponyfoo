'use strict';

var config = require('../../config'),
    defaults = require('../common/routing.js'),
    homeController = require('./controllers/homeController.js'),
    installController = require('./controllers/api/installController.js');

function setup(server){
    server.get('/*', function(req, res, next){
        if (req.slug !== config.server2.slug.landing){
            res.redirect(config.server2.authorityLanding + req.url);    
        }else{
            next();
        }
    });

    // rest api
    server.post('/api/1.0/install', installController.postInstall);

    // views
    server.get('/', homeController.getIndex);

    defaults.configure(server);
    
    server.get('/*', function(req, res){
        res.redirect('/');
    });
}

module.exports = {
    setup: setup
};