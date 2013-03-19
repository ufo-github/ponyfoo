'use strict';

var rest = require('../../../services/rest.js'),
    $ = require('../../../services/$.js'),
    controllers = './../../../controllers/api/1.0/',
    blog = require(controllers + '/blog.js'),
    entry = require(controllers + '/entry.js'),
    comment = require(controllers + '/comment.js'),
    user = require(controllers + '/user.js'),
    file = require(controllers + '/file.js');

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

function blogger(req,res,next){
    var connected = !!req.user,
        authorized = connected && req.user.blogger === true;
    if (authorized !== true){
        rest.unauthorized(req,res);
    }else{
        next();
    }
}

function paged(api, path){
    var paging = '/p/:page([2-9]|[1-9][0-9]+)',
        callbacks = $.args(arguments).slice(2),
        regular = [path].concat(callbacks),
        page = [path + paging].concat(callbacks);

    api.get.apply(null, regular);
    api.get.apply(null, page);
}

function routeBlog(api){
    api.post('/blog/claim', blog.claim);
    api.put('/blog', blogger, blog.update);
}

function routeEntries(api){
    var routeEntry = '/entry/:id([0-9a-f]{24})',
        routeYear = '/entry/:year([0-9]{4})',
        routeMonth = routeYear + '/:month(0[1-9]|1[0-2])',
        routeDay = routeMonth + '/:day(0[1-9]|[12][0-9]|3[01])',
        routeSlug = routeDay + '/:slug([a-z0-9\\-]+)';

    // entry lists, search
    paged(api, '/entry', entry.get);
    paged(api, routeYear, entry.getByDate);
    paged(api, routeMonth, entry.getByDate);
    paged(api, routeDay, entry.getByDate);
    paged(api, '/entry/search/:keywords', entry.search);
    paged(api, '/entry/search/tagged/:tags', entry.tagged);

    // one entry
    api.get(routeSlug, entry.getBySlug);
    api.get(routeEntry, entry.getById);

    // insert, update, delete
    api.put('/entry', blogger, entry.ins);
    api.put(routeEntry, blogger, entry.upd);
    api.del(routeEntry, blogger, entry.del);
}

function routeComments(api){
    var routeEntry = '/entry/:entryId([0-9a-f]{24})',
        routeComment = routeEntry + '/comment',
        routeDiscussion = '/discussion',
        routeReply = routeDiscussion + '/:id([a-f0-9]{24})/comment',
        routeOne = routeReply + '/:commentId([a-f0-9]{24})';

    // get discussion threads
    paged(api, routeDiscussion, blogger, comment.discussions);

    api.get(routeComment, comment.get);

    // insert discussion, comment
    api.put(routeComment, connected, comment.discuss);
    api.put(routeReply, connected, comment.reply);

    // edit comment, delete comment
    api.put(routeOne, connected, comment.edit);
    api.del(routeOne, connected, comment.del);
}

function routeUsers(api){
    paged(api, '/user', blogger, user.get);

    api.get('/user/:id([a-f0-9]{24})', user.getById);
    api.put('/user/:id([a-f0-9]{24})', connected, user.upd);
}

function routeFiles(api){
    api.put('/file', connected, file.upload);
}

function configure(server){
    var api = routing(server);

    routeBlog(api);
    routeEntries(api);
    routeComments(api);
    routeUsers(api);
    routeFiles(api);

    api.all('/*', rest.notFound);
}

module.exports = {
    configure: configure
};