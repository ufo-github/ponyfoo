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
    model.findOne(query, wrapCallback(res, function(result){
        return { entry: result };
    }));
}

function rebuildFeed(res){
    return function(){
        res.end();
        var feed = require('../../../logic/feed.js');
        process.nextTick(feed.rebuild);
    };
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
    ins: function(req,res){
        crud.create(req.body.entry, {
            res: res,
            always: function(entry){
                entry.slug = text.slug(entry.title);
            },
            then: rebuildFeed(res)
        });
    },
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
	del: function(req,res){
        crud.remove({ _id: req.params.id }, {
            res: res,
            then: rebuildFeed(res)
        });
    },
    list: list // internal api DRY purposes
};