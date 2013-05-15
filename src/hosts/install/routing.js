'use strict';

var defaults = require('../common/routing.js'),
    homeController = require('./controllers/homeController.js'),
    installController = require('./controllers/api/installController.js');

function setup(server){
    server.get('/*', function(req, res, next){
        console.log(req.host); // TODO: should redirect if not on main slug.
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