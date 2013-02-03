var rest = require('../../../services/rest.js'),
    $ = require('../../../services/$.js'),
    entry = require('./../../../controllers/api/1.0/entry.js'),
    comment = require('./../../../controllers/api/1.0/comment.js');

function routing(server){
	var base = '/api/1.0',
		verbs = ['get','post','put','del','all'],
		methods = {};

	verbs.forEach(function(v){
		methods[v] = function(){
            var args = $.args(arguments);
            args[0] = base + args[0]; // always use api endpoints.
            server[v].apply(server, args);
		};
	});
	
	return methods;
}

function connected(req,res,next){
    if(!!req.user){
        next();
    }else{
        unauthorized(req,res,401);
    }
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

function routeEntries(api){
    var routeEntry = '/entry/:id([0-9a-f]+)',
        routeYear = '/entry/:year([0-9]{4})',
        routeMonth = routeYear + '/:month(0[1-9]|1[0-2])',
        routeDay = routeMonth + '/:day(0[1-9]|[12][0-9]|3[01])',
        routeSlug = routeDay + '/:slug([a-z0-9\-]+)';

    // entry lists, search
    paged(api, '/entry', entry.get);
    paged(api, routeYear, entry.getByDate);
    paged(api, routeMonth, entry.getByDate);
    paged(api, routeDay, entry.getByDate);
    paged(api, '/entry/search/:keywords', entry.search);

    // one entry
    api.get(routeSlug, entry.getBySlug);
    api.get(routeEntry, entry.getById);

    // insert, update, delete
    api.put('/entry', author, entry.ins);
    api.put(routeEntry, author, entry.upd);
    api.del(routeEntry, author, entry.del);
}

function routeComments(api){
    var routeEntry = '/entry/:entryId([0-9a-f]+)',
        routeComments = routeEntry + '/comments',
        routeDiscussion = routeEntry + '/comment',
        routeComment = '/discussion/:id([a-f0-9]+)/comment';

    // get discussion threads
    api.get(routeComments, comment.get);

    // insert discussion, comment
    api.put(routeDiscussion, connected, comment.discuss);
    api.put(routeComment, connected, comment.ins);
}

function configure(server){
    var api = routing(server);

    routeEntries(api);
    routeComments(api);

    api.all('/*', notFound);
}

module.exports = {
    configure: configure
};