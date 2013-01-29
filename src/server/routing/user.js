var controller = require('../../controllers/user.js');

function configure(server){
    server.get('/user/register', controller.guard);
    server.get('/user/login', controller.guard, controller.login);
    server.get('/user/logout', controller.logout);

    server.post('/user/register', controller.register);
    server.post('/user/login', controller.authenticate);
}


module.exports = {
    configure: configure
};