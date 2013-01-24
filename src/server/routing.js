var site = require('../controllers/site.js'),
    apiRoutes = require('../controllers/api/routing.js'),
    user = require('../controllers/user.js');

function authRoutes(server){
    server.get('/user/register', user.guard);
    server.get('/user/login', user.guard);
    server.get('/user/logout', user.logout);

    server.post('/user/register', user.register);
    server.post('/user/login', user.login);
}

function routing(server){
    apiRoutes.configure(server);
    authRoutes(server);
    server.get('/*', site.get);
}

module.exports = {
    map: routing
};