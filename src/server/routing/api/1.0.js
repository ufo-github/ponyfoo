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
        rest.unauthorized(req,res,401);
    }
}

function author(req,res,next){
    var connected = !!req.user,
        authorized = connected && req.user.author === true;
    if (authorized !== true){
        rest.unauthorized(req,res);
    }else{
        next();
    }
}

function paged(api, path, cb){
    var paging = '/p/:page([2-9]|[1-9][0-9]+)';

    api.get(path, cb);
    api.get(path + paging, cb);
}

function routeEntries(api){
    var routeEntry = '/entry/:id([0-9a-f]{24})',
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
    var routeEntry = '/entry/:entryId([0-9a-f]{24})',
        routeComment = routeEntry + '/comment',
        routeReply = '/discussion/:id([a-f0-9]{24})/comment',
        routeOne = routeReply + '/:commentId([a-f0-9]{24})';

    // get discussion threads
    api.get(routeComment, comment.get);

    // insert discussion, comment
    api.put(routeComment, connected, comment.discuss);
    api.put(routeReply, connected, comment.reply);

    // edit comment, delete comment
    api.put(routeOne, connected, comment.edit);
    api.del(routeOne, connected, comment.del);
}

function configure(server){
    var api = routing(server);

    routeEntries(api);
    routeComments(api);

    api.all('/*', rest.notFound);
}

module.exports = {
    configure: configure
};