var async = require('async'),
    apiConf = require('../config.js'),
    rest = require('../../../services/rest.js'),
    text = require('../../../services/text.js'),
    model = require('../../../models/entry.js'),
    crud = require('../../../services/crud.js')(model);

function mapRequestToQuery(req){
    var year = req.params.year,
        month = req.params.month,
        day = req.params.day;

    return {
        date: {
            $gte: new Date(year, (month||1)-1, day||1),
            $lt: new Date(year, (month||12)-1, day||31, 24)
        }
    };
}

function wrapCallback(res, map){
    return function (err,response){
        rest.resHandler(err, {
            res: res,
            then: function(){
                rest.end(res,map ? map(response) : response);
            }
        });
    };
}

function list(opts,done){
    var page = parseInt(opts.page || 1),
        lim = opts.limit || apiConf.paging.limit,
        index = (page-1) * lim,
        where = model.find(opts.query || {});

    async.parallel({
        entries: function(cb){
            where.sort('-date').skip(index).limit(lim).exec(cb);
        },
        paging: function(cb){
            where.count().exec(function(err,count){
                cb(err, {
                    page: page,
                    index: index,
                    limit: lim,
                    total: count,
                    next: count > index + lim ? page + 1 : false
                });
            });
        }
    },done);
}

function restList(req,res,query){
    list({
        query: query,
        page: req.params.page
    }, wrapCallback(res));
}

function restOne(res, query){
    model.findOne(query, function(err,entry){
        unwrapSiblings(entry, wrapCallback(res, function(result){
            return { entry: result };
        }));
    });
}

function rebuildFeed(res){
    return function(){
        rest.end(res,{});
        var feed = require('../../../logic/feed.js');
        process.nextTick(feed.rebuild);
    };
}

function insert(req,res){
    model.findOne().sort('-date').exec(function(err,previous){
        if(err){
            throw err;
        }

        crud.create(req.body.entry, {
            res: res,
            always: function(entry){
                entry.previous = previous._id;
                entry.slug = text.slug(entry.title);
            },
            then: function(entry){
                previous.next = entry._id;
                previous.save(rebuildFeed(res));
            }
        });
    });

}

function remove(req, res){
    model.findOne({ _id: req.params.id }, function(err,entry){
        if(err){
            throw err;
        }

        var prev = entry.previous,
            next = entry.next,
            query = { _id: { $in: [prev, next] } };

        model.find(query, function(err, siblings){
            if(err){
                throw err;
            }

            async.forEach(siblings, function(sibling, done){
                if (prev !== null && sibling._id.equals(prev)){
                    sibling.next = next;
                }
                if (next !== null && sibling._id.equals(next)){
                    sibling.previous = prev;
                }
                sibling.save(done);
            },function(err){
                if(err){
                    throw err;
                }

                entry.remove(rebuildFeed(res));
            });
        });
    });
}

function unwrapSiblings(entry,cb){
    var query = { _id: { $in: [entry.previous, entry.next] } };

    model.find(query, function(err, siblings){
        if(err){
            throw err;
        }

        var unwrapped = entry.toObject();
        unwrapped.related = {};

        siblings.forEach(function(sibling){
            var key = sibling._id.equals(entry.previous) ? 'previous' : 'next';

            unwrapped.related[key] = {
                url: sibling.getPermalink(),
                title: sibling.title
            };
        });

        cb(null, unwrapped);
    });
}

function migrate(req,res){
    model.find().sort('-date').exec(function(err,documents){
        async.forEach(documents,function(document,done){
            var i = documents.indexOf(document);
            if (i !== 0){
                document.next = documents[i-1]._id;
            }
            if (i !== documents.length - 1){
                document.previous = documents[i+1]._id;
            }
            document.save(done);
        },function(){
            res.end();
        });
    });
}
module.exports = {
    get: function(req,res){
        restList(req,res);
    },
	getByDate: function(req,res){
		var query = mapRequestToQuery(req);
        restList(req, res, query);
	},
	getBySlug: function(req,res){
        var query = mapRequestToQuery(req);
        query.slug = req.params.slug;
        restOne(res, query);
	},
	getById: function(req,res){
        restOne(res, { _id: req.params.id });
	},
    ins: insert,
	upd: function(req,res){
        crud.update({ _id: req.params.id }, req.body.entry, {
            res: res,
            always: function(entry){
                entry.updated = new Date();
                entry.slug = text.slug(entry.title);
            },
            then: rebuildFeed(res)
        });
	},
	del: remove,
    list: list, // internal api DRY purposes
    migrate: migrate
};