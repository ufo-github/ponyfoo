var site = require('../controllers/site.js'),
    apiRoutes = require('../controllers/api/routing.js'),
    user = require('../controllers/user.js');

function routing(server){
    apiRoutes(server);

    server.post('/user/register', user.register);
    server.post('/user/login', user.login);
    server.get('/user/logout', user.logout);

    server.get('/*', site.get);
}

module.exports = {
    map: routing
};