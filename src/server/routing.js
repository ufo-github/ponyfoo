var site = require('../controllers/site.js');
var entry = require('../controllers/entry.js');

function registerApiRoutes(server){
	var api = '/api/1.0';
	
	function get(endpoint, action) {
		server.get(api+endpoint,action);
	}

    function put(endpoint, action) {
        server.put(api+endpoint,action);
    }
	
	function del(endpoint, action) {
		server.del(api+endpoint,action);
	}

    get('/entry', entry.get);
    get('/entry/:id([0-9a-f]+)', entry.getOne);
    put('/entry', entry.put);
	put('/entry/:id([0-9a-f]+)', entry.upd);
	del('/entry/:id([0-9a-f]+)', entry.del);
}

module.exports = function(server){	
	registerApiRoutes(server);
	
	server.get('/*', site.get);
};