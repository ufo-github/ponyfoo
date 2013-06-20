'use strict';

var express= require('express'),
    config = require('../../config'),
    defaults = require('../common/routing.js'),
    opensearchController = require('./controllers/opensearchController.js'),
    viewController = require('./controllers/viewController.js');

function setup(server){
    server.get('/opensearch.xml', opensearchController.getOpensearch);

    defaults.configure(server);

    // views
    server.get('/*', viewController.getDocs);
}

module.exports = {
    setup: setup
};