var rest = require('../../../services/rest.js'),
    $ = require('../../../services/$.js'),
    controller = require('./../../../controllers/api/1.0/entry.js');

function routing(server){
	var base = '/api/1.0',
		verbs = ['get','post','put','del','all'],
		methods = {};

	verbs.forEach(function(v){
		methods[v] = function(){
            var args = $.args(arguments);
            args[0] = base + args[0]; // resources are always api endpoints.
            server[v].apply(server, args);
		};
	});
	
	return methods;
}

function author(req,res,next){
    var connected = !!req.user,
        authorized = connected && req.user.author === true;
    if (authorized !== true){
        unauthorized(req,res,connected?403:401);
    }else{
        next();
    }
}

function unauthorized(req, res, code){
    rest.error(res,code,'api endpoint unauthorized');
}

function notFound(req, res){
    rest.error(res,404,'api endpoint not found');
}

function paged(api, path, cb){
    var paging = '/p/:page([2-9]|[1-9][0-9]+)';

    api.get(path, cb);
    api.get(path + paging, cb);
}

function configure(server){
    var api = routing(server),
        routeYear = '/entry/:year([0-9]{4})',
        routeMonth = routeYear + '/:month(0[1-9]|1[0-2])',
        routeDay = routeMonth + '/:day(0[1-9]|[12][0-9]|3[01])',
        routeSlug = routeDay + '/:slug([a-z0-9\-]+)';

    paged(api, '/entry', controller.get);
    paged(api, routeYear, controller.getByDate);
    paged(api, routeMonth, controller.getByDate);
    paged(api, routeDay, controller.getByDate);
    paged(api, '/entry/search/:keywords', controller.search);

    api.get(routeSlug, controller.getBySlug);
    api.get('/entry/:id([0-9a-f]+)', controller.getById);

    api.put('/entry', author, controller.ins);
    api.put('/entry/:id([0-9a-f]+)', author, controller.upd);
    api.del('/entry/:id([0-9a-f]+)', author, controller.del);

    api.all('/*', notFound);
}

module.exports = {
    configure: configure
};