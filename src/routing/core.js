var main = require('../controllers/main.js');
var entry = require('../controllers/entry.js');

function registerApiRoutes(server){
	var api = '/api/1.0';
	
	function put(endpoint, action) {
		server.put(endpoint,action);
	}
	
	function get(endpoint, action) {
		server.get(endpoint,action);
	}
	
    put('/entry', entry.put);	
	get('/entry/latest', entry.get);
}

module.exports = function(server){	
	registerApiRoutes(server);
	
	server.get('/*', main.get);
};