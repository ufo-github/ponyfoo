var main = require('../controllers/main.js');
var entry = require('../controllers/entry.js');

function registerApiRoutes(server){
	var api = '/api/1.0';
	
	function register(verb, endpoint, action) {
		server[verb](api + endpoint, action);
	}
	
	function put(endpoint, action) {
		register('put',endpoint,action);
	}
	
	function get(endpoint, action) {
		register('get',endpoint,action);
	}
	
    put('/entry', entry.put);	
	get('/entry/latest', entry.get);
};

module.exports = function(server){	
	registerApiRoutes(server);
	
	server.get('/*', main.get);
};