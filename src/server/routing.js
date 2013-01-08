var site = require('../controllers/site.js');
var entry = require('../controllers/entry.js');

function registerApiRoutes(server){
	
	function get(endpoint, action) {
		server.get(api+endpoint,action);
	}
    function put(endpoint, action) {
        server.put(api+endpoint,action);
    }	
	function del(endpoint, action) {
		server.del(api+endpoint,action);
	}
	function all(endpoint, action) {
		server.all(api+endpoint,action);
	}

    get('/entry', entry.get);
    
	get('/entry/:year/:month?/:day?', entry.getByDate);
	get('/entry/:year/:month/:day/:slug', entry.getBySlug);
	
    get('/entry/:id([0-9a-f]+)', entry.getOne);
    put('/entry', entry.put);
	put('/entry/:id([0-9a-f]+)', entry.upd);
	del('/entry/:id([0-9a-f]+)', entry.del);
	
	all('/*', function(req, res){
		var json = JSON.stringify({
			error: true
		});
		res.writeHead(200, {
			'Content-Type': 'application/json',
			'Cache-Control': 'no-cache'
		});
		res.write(json);
		res.end();
	});
}

module.exports = function(server){	
	registerApiRoutes(server);
	
	server.get('/*', site.get);
};