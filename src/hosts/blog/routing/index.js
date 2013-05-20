'use strict';

var config = require('../../../config'),
    defaults = require('../../common/routing.js'),
    api = require('./api.js'),
    blogController = require('../controllers/blogController.js'),
    viewController = require('../controllers/viewController.js');

function setup(server){
    server.all('/*', blogController.ensureTakenThenHydrate);

    // rest api
    api.configure(server);

    // defaults
    defaults.configure(server);

    // views
    server.get('/*', viewController.getView); // GET catch-all
}

module.exports = {
    setup: setup
};