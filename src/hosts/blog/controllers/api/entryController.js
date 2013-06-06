'use strict';

var mongoose = require('mongoose'),
    async = require('async'),
    jsdom = require('jsdom'),
    pagedown = require('pagedown'),
    api = require('../../../../config').api,
    Discussion = require('../../../../model/Discussion.js'),
    Entry = require('../../../../model/Entry.js'),
    entryService = require('../../../../service/blogEntryService.js'),
    broadcastService = require('../../../../service/broadcastService.js'),
    assetService = require('../../../../service/assetService.js'),
    rest = require('../../../../service/restService.js'),
    text = require('../../../../service/textService.js'),
    crud = require('../../../../service/crudService.js')(Entry);

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

function list(opts,then){
    opts.query = opts.query || {};
    opts.query.blog = opts.blog;

    opts.listName = 'entries';
    opts.limit = opts.limit || api.paging.limit;
    opts.sort = '-date';
    opts.mapper = function(documents, cb){
        async.map(documents, function(document, done){
            Discussion.find({ entry: document._id }, function(err, discussions){
                if(err){
                    done(err);
                    return;
                }

                var result = document.toObject();
                result.commentCount = discussions.reduce(function(accumulator, discussion) {
                    return accumulator + discussion.comments.length;
                }, 0);
                done(null, result);
            });
        }, cb);
    };

    crud.list(opts, then);
}

function restList(req,res,query){
    list({
        blog: req.blog._id,
        query: query,
        page: req.params.page
    }, rest.wrapCallback(res));
}

function restOne(req, res, query){
    query.blog = req.blog._id;

    Entry.findOne(query, function(err,entry){
        if(err){
            throw err;
        }

        unwrapSiblings(req.blog._id, entry, rest.wrapCallback(res, function(result){
            return { entry: result };
        }));
    });
}

function insert(req,res){
    var document = entryService.validate(req,res);
    if (document === undefined){
        return;
    }

    Entry.findOne({ blog: req.blog._id }).sort('-date').exec(function(err,previous){
        if(err){
            throw err;
        }

        crud.create(document, {
            res: res,
            always: function(entry){
                entry.blog = req.blog._id;
                entry.previous = previous ? previous._id : undefined;
                entry.slug = text.slug(entry.title);
            },
            then: function(entry){
                if (previous){
                    previous.next = entry._id;
                    previous.save(function(){
                        broadcastService.publish({
                            entry: entry,
                            blog: req.blog
                        }, function(){
                            rest.end(res,{});
                        });
                    });
                }
            }
        });
    });
}

function update(req,res){
    var document = entryService.validate(req,res,true);
    if (document === undefined){
        return;
    }

    crud.update({ _id: req.params.id, blog: req.blog._id }, document, {
        res: res,
        always: function(entry){
            entry.updated = new Date();
            entry.slug = text.slug(entry.title);
        },
        then: function(){
            rest.end(res,{});
        }
    });
}

function remove(req, res){
    var id = mongoose.Types.ObjectId(req.params.id);

    Entry.findOne({ _id: id, blog: req.blog._id }, function(err,entry){
        if(err){
            throw err;
        }

        var prev = entry.previous,
            next = entry.next,
            query = {
                _id: {
                    $in: [prev, next]
                },
                blog: req.blog._id
            };

        Entry.find(query, function(err, siblings){
            if(err){
                throw err;
            }

            Discussion.find({ entry: id }).remove(); // remove discussions

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

                entry.remove(function(){
                    rest.end(res,{});
                });
            });
        });
    });
}

function unwrapSiblings(blogId,entry,cb){
    if (entry === null){ // sanity.
        process.nextTick(function(){
            cb(null, null);
        });
        return;
    }

    var prev = entry.previous,
        next = entry.next,
        query = {
            _id: {
                $in: [entry.previous, entry.next]
            },
            blog: blogId
        };

    Entry.find(query, function(err, siblings){
        if(err){
            throw err;
        }

        var unwrapped = entry.toObject();
        unwrapped.related = {};

        siblings.forEach(function(sibling){
            var key = prev !== null && sibling._id.equals(prev) ? 'previous' : 'next';

            unwrapped.related[key] = {
                url: sibling.permalink,
                title: sibling.title
            };
        });

        cb(null, unwrapped);
    });
}

var separator = / |,|\+|;/;

function search(req,res){
    var keywords = req.params.keywords.split(separator), escaped;

    keywords.forEach(function(keyword, i){ // escape them
        escaped = keyword.replace(/([.?*+\^$\[\]\\(){}|\-])/g, '\\$1');
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

function tagged(req,res){
    var tags = req.params.tags.toLowerCase().split(separator);
    restList(req,res,{ tags: { $all: tags }});
}

function getPlainTextBrief(entry, done) {
    var converter = new pagedown.getSanitizingConverter(),
        html = converter.makeHtml(entry.brief);

    jsdom.env({
        html: '<foo>' + html + '</foo>', // empty and <HTML> tags throw, for some obscure reason.
        scripts: [assetService.jQuery.absolute],
        done: function(err,window){
            if(err){
                return done(err);
            }
            var $ = window.$, plain;
            if (typeof $ !== 'function'){
                return done('jQuery not a function');
            }
            plain = $(':root').text();
            done(null, plain);
        }
    });
}

module.exports = {
    get: function(req,res){
        restList(req,res, {});
    },
    getByDate: function(req,res){
        var query = mapRequestToQuery(req);
        restList(req, res, query);
    },
    getBySlug: function(req,res){
        var query = mapRequestToQuery(req);
        query.slug = req.params.slug;
        restOne(req, res, query);
    },
    getById: function(req,res){
        restOne(req, res, { _id: req.params.id });
    },
    ins: insert,
    upd: update,
    del: remove,
    list: list,
    search: search,
    tagged: tagged,
    getPlainTextBrief: getPlainTextBrief
};