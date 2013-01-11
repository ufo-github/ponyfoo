var rest = require('../../services/rest.js'),
    entry = require('./1.0/entry.js');

function apiRouting(server){
	var base = '/api/1.0',
		verbs = ['get','post','put','del','all'],
		methods = {};
	
	function register(endpoint, cb, verb) {
		server[verb](base + endpoint, cb);
	}
	
	verbs.forEach(function(v){
		methods[v] = function(endpoint, cb){
			register(endpoint, cb, v);
		};
	});
	
	return methods;
}

function apiAuthentication(req,res,next){
    var authorized = !!req.user && req.user.author;
    if(!authorized){
        apiUnauthorized(req,res);
    }else{
        next();
    }
}

function apiUnauthorized(req, res){
    rest.error(res,401,'api endpoint unauthorized');
}

function apiNotFound(req, res){
    rest.error(res,404,'api endpoint not found');
}

module.exports = function (server){
    var api = apiRouting(server),
        routeYear = '/entry/:year([0-9]{4})',
        routeMonth = routeYear + '/:month(0[1-9]|1[0-2])',
        routeDay = routeMonth + '/:day(0[1-9]|[12][0-9]|3[01])',
        routeSlug = routeDay + '/:slug([a-z0-9\-]+)';

    api.put('/*', apiAuthentication);
    api.del('/*', apiAuthentication);

    api.get('/entry', entry.get);
    api.get(routeYear, entry.getByDate);
    api.get(routeMonth, entry.getByDate);
    api.get(routeDay, entry.getByDate);
    api.get(routeSlug, entry.getBySlug);

    api.get('/entry/:id([0-9a-f]+)', entry.getById);
    api.put('/entry', entry.put);
    api.put('/entry/:id([0-9a-f]+)', entry.upd);
    api.del('/entry/:id([0-9a-f]+)', entry.del);

    api.all('/*', apiNotFound);
};