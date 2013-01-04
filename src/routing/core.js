var site = require('../controllers/site.js');
var entry = require('../controllers/entry.js');

function registerApiRoutes(server){
	var api = '/api/1.0';
	
	function put(endpoint, action) {
		server.put(api+endpoint,action);
	}
	
	function get(endpoint, action) {
		server.get(api+endpoint,action);
	}
	
	function del(endpoint, action) {
		server.del(api+endpoint,action);
	}
	
    put('/entry', entry.put);
	get('/entry', entry.get);
	del('/entry', entry.del);
}

module.exports = function(server){	
	registerApiRoutes(server);
	
	server.get('/*', site.get);
};