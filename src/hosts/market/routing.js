'use strict';

var config = require('../../config'),
    defaults = require('../common/routing.js'),
    homeController = require('./controllers/homeController.js');

function setup(server){
    
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