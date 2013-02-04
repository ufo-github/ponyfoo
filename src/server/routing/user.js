var config = require('../../config.js'),
    controller = require('../../controllers/user.js');


function configure(server){
    server.get(config.auth.register, controller.guard);
    server.get(config.auth.login, controller.guard);
    server.get(config.auth.logout, controller.logout);

    server.post(config.auth.register, controller.guard, controller.register);
    server.post(config.auth.login, controller.guard, controller.local);

    function configureProvider(name){
        server.get(config.auth[name].link, controller[name].auth);
        server.get(config.auth[name].callback, controller[name].callback);
    }

    configureProvider('facebook');
    configureProvider('github');
    configureProvider('google');
}

module.exports = {
    configure: configure
};