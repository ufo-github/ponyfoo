var site = require('../controllers/site.js'),
    apiRoutes = require('../controllers/api/routing.js');

module.exports = function(server){
    apiRoutes(server);
	
	server.get('/*', site.get);
};