var site = require('../controllers/site.js');
var entry = require('../controllers/entry.js');

function api(server){
	var base = '/api/1.0',
		verbs = ['get','post','put','del','all'],
		exposed;
	
	function register(endpoint, cb, method) {
		server[method](api + endpoint, cb);
	}
	
	verbs.forEach(function(verb){
		exposed[verb] = function(endpoint, cb){
			register(endpoint, cb, verb);
		}
	});
	
	return exposed;
}

function registerApiRoutes(server){
	var a = api(server);
	
    a.get('/entry', entry.get);
    
	a.get('/entry/:year/:month?/:day?', entry.getByDate);
	a.get('/entry/:year/:month/:day/:slug', entry.getBySlug);
	
    a.get('/entry/:id([0-9a-f]+)', entry.getOne);
    a.put('/entry', entry.put);
	a.put('/entry/:id([0-9a-f]+)', entry.upd);
	a.del('/entry/:id([0-9a-f]+)', entry.del);
	
	a.all('/*', function(req, res){
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