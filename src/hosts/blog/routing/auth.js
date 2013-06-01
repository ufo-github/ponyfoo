'use strict';

var config = require('../../../config'),
    controller = require('../controllers/authenticationController.js'),
    providers = ['facebook','github','google','linkedin'];

function configure(server){
    server.get(config.auth.login, controller.requireAnonymous);
    server.get(config.auth.logout, controller.logout);

    server.post(config.auth.login, controller.requireAnonymous, controller.login, controller.redirect);

    server.post(config.auth.ancient, controller.requireAnonymous, controller.ancient, controller.redirect);

    function configureProvider(name){
        if(!config.auth[name].enabled){
            return;
        }
        server.get(config.auth[name].link, controller.rememberReturnUrl, controller[name].auth);
        server.get(config.auth[name].callback, controller[name].callback, controller.redirect);
    }

    for(var key in providers){
        configureProvider(providers[key]);
    }
}

module.exports = {
    configure: configure
};