var mongoose = require('mongoose'),
    async = require('async'),
    apiConf = require('../config.js'),
    validation = require('../../../services/validation.js'),
    rest = require('../../../services/rest.js'),
    text = require('../../../services/text.js'),
    discussion = require('../../../models/discussion.js'),
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
        if(err){
            throw err;
        }

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

function validateEntry(req,res,update){
    var source = req.body.entry || {};

    return validation.validate(req,res,{
        ignoreUndefined: update,
        document: {
            title: source.title,
            brief: source.brief,
            text: source.text
        },
        rules: [
            { field: 'title', length: 10, message: 'You forgot the all-important, descriptive title' },
            { field: 'brief', length: 30, message: 'Please remember to write an introduction to your post' },
            { field: 'text', length: 60, message: 'That was pretty scarce. Do you mind sharing at least a pair of sentences in your article?' }
        ]
    });
}

function insert(req,res){
    var document = validateEntry(req,res);
    if (document === undefined){
        return;
    }

    model.findOne().sort('-date').exec(function(err,previous){
        if(err){
            throw err;
        }

        crud.create(document, {
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

function update(req,res){
    var document = validateEntry(req,res,true);
    if (document === undefined){
        return;
    }

    crud.update({ _id: req.params.id }, document, {
        res: res,
        always: function(entry){
            entry.updated = new Date();
            entry.slug = text.slug(entry.title);
        },
        then: rebuildFeed(res)
    });
}

function remove(req, res){
    var id = mongoose.Types.ObjectId(req.params.id);

    model.findOne({ _id: id }, function(err,entry){
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

            discussion.find({ entry: id }).remove(); // remove discussions

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
    if (entry == null){ // sanity.
        process.nextTick(function(){
            cb(null, null);
        });
        return;
    }

    var prev = entry.previous,
        next = entry.next,
        query = { _id: { $in: [entry.previous, entry.next] } };

    model.find(query, function(err, siblings){
        if(err){
            throw err;
        }

        var unwrapped = entry.toObject();
        unwrapped.related = {};

        siblings.forEach(function(sibling){
            var key = prev !== null && sibling._id.equals(prev) ? 'previous' : 'next';

            unwrapped.related[key] = {
                url: sibling.getPermalink(),
                title: sibling.title
            };
        });

        cb(null, unwrapped);
    });
}

function search(req,res){
    var keywords = req.params.keywords.split(/ |,|\+|-|;/), escaped, query;

    keywords.forEach(function(keyword, i){ // escape them
        escaped = keyword.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        keywords[i] = new RegExp(escaped, 'i');
    });

    function target(field){
        var query = [];

        keywords.forEach(function(keyword){
            var expression = {};
            expression[field] = keyword;
            query.push(expression);
        });

        return query;
    }

    restList(req,res, {
        $or: [
            { $and: target('title') },
            { $and: target('brief') },
            { $and: target('text') }
        ]
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
    upd: update,
    del: remove,
    list: list, // internal api DRY purposes
    search: search
};