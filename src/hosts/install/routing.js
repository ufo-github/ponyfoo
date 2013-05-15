'use strict';

var defaults = require('../common/routing.js'),
    homeController = require('./controllers/homeController.js');

function setup(server){
    server.get('/', homeController.getIndex);

    defaults.configure(server);
    
    server.get('/*', function(req,res){
        res.redirect('/');
    });
}

module.exports = {
    setup: setup
};