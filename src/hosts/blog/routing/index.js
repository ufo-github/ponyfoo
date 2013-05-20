'use strict';

var config = require('../../../config'),
    defaults = require('../../common/routing.js'),
    api = require('./api.js'),
    auth = require('./auth.js'),
    blogController = require('../controllers/blogController.js'),
    viewController = require('../controllers/viewController.js');

function setup(server){
    server.all('/*', blogController.ensureTakenThenHydrate);

    //auth.configure(server); // authentication
    //api.configure(server); // rest api
    
    defaults.configure(server);

    server.get('/*', viewController.getView); // GET catch-all, views
}

module.exports = {
    setup: setup
};