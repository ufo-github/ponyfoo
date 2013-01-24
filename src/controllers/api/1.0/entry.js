var async = require('async'),
    apiConf = require('../config.js'),
    rest = require('../../../services/rest.js'),
    text = require('../../../services/text.js'),
    models = require('../../../models/all.js'),
    model = models.entry,
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

function list(req, res, query){
    var page = parseInt(req.params.page || 1),
        lim = apiConf.paging.limit,
        index = (page-1) * lim,
        where = model.find(query);

    async.parallel({
        entries: function(done){
            where.sort('-date').skip(index).limit(lim).exec(done);
        },
        paging: function(done){
            where.count().exec(function(err,count){
                done(err, {
                    page: page,
                    index: index,
                    limit: lim,
                    total: count,
                    next: count > index + lim ? page + 1 : false
                });
            });
        }
    },wrapCallback(res));
}

function single(res, query){
    model.findOne(query).exec(wrapCallback(res, function(result){
        return { entry: result };
    }));
}

module.exports = {
    get: function(req,res){
		list(req, res, {});
    },
	
	getByDate: function(req,res){
		var query = mapRequestToQuery(req);
		list(req, res, query);
	},

	getBySlug: function(req,res){
        var query = mapRequestToQuery(req);
        query.slug = req.params.slug;
		single(res, query);
	},

	getById: function(req,res){
        single(res, { _id: req.params.id });
	},

    ins: function(req,res){
        crud.create(req.body.entry, {
            res: res,
            always: function(entry){
                entry.slug = text.slug(entry.title);
            }
        });
    },

	upd: function(req,res){
        crud.update({ _id: req.params.id }, req.body.entry, {
            res: res,
            always: function(entry){
                entry.updated = new Date();
                entry.slug = text.slug(entry.title);
            }
        });
	},

	del: crud.http.remove
};