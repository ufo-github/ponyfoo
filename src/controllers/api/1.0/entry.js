var mongoose = require('mongoose'),
    async = require('async'),
    jsdom = require('jsdom'),
    pagedown = require('pagedown'),
    config = require('../../../config.js'),
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

function list(opts,then){
    opts.listName = 'entries';
    opts.limit = opts.limit || apiConf.paging.limit;
    opts.sort = '-date';
    opts.mapper = function(documents, cb){
        async.map(documents, function(document, done){
            discussion.find({ entry: document._id }, function(err, discussions){
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
    query.blog = req.blog._id;

    list({
        query: query,
        page: req.params.page
    }, rest.wrapCallback(res));
}

function restOne(req, res, query){
    query.blog = req.blog._id;

    model.findOne(query, function(err,entry){
        if(err){
            throw err;
        }

        unwrapSiblings(req.blog._id, entry, rest.wrapCallback(res, function(result){
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
            text: source.text,
            tags: source.tags
        },
        rules: [
            { field: 'title', length: { min: 6, max: 50 }, message: 'The article\'s title should be somewhere between 6 and 50 characters long' },
            { field: 'brief', length: 20, message: 'Please remember to write an introduction to your post. Use at least 20 characters' },
            { field: 'brief', length: { max: 10000 }, required: false, message: 'Your introduction\'s markdown shouldn\'t exceed 10k characters in length' },
            { field: 'text', length: 30, message: 'That was pretty scarce. Do you mind sharing at least a pair of sentences in your article? Type at least 30 characters' },
            { field: 'text', length: { max: 30000 }, required: false, message: 'Your article\'s markdown can\'t exceed 30k characters in length' },
            { field: 'tags', validator: function(){
                var self = this, failed;

                if(!Array.isArray(self) || self.length === 0){
                    return 'Tag your article with at least one keyword';
                }else if(self.length > 5){
                    return 'Six tags are enough. Pick the most relevant ones';
                }

                failed = self.some(function(tag, i){
                    if(typeof tag === 'string'){
                        self[i] = tag.replace(/ /g,'').toLowerCase();
                        return !/^[a-z0-9._-]+$/.test(self[i]);
                    }else{
                        return true;
                    }
                });

                if(failed){
                    return 'Tags can only contain letters, numbers, or punctuation';
                }
            }}
        ]
    });
}

function insert(req,res){
    var document = validateEntry(req,res);
    if (document === undefined){
        return;
    }

    model.findOne({ blog: req.blog._id }).sort('-date').exec(function(err,previous){
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
                    previous.save(rebuildFeed(res));
                }
            }
        });
    });
}

function update(req,res){
    var document = validateEntry(req,res,true);
    if (document === undefined){
        return;
    }

    crud.update({ _id: req.params.id, blog: req.blog._id }, document, {
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

    model.findOne({ _id: id, blog: req.blog._id }, function(err,entry){
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

function unwrapSiblings(blogId,entry,cb){
    if (entry == null){ // sanity.
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

    model.find(query, function(err, siblings){
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
    var keywords = req.params.keywords.split(separator), escaped, query;

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

function tagged(req,res){
    var tags = req.params.tags.toLowerCase().split(separator);
    restList(req,res,{ tags: { $all: tags }});
}

function getPlainTextBrief(entry, done) {
    var converter = new pagedown.getSanitizingConverter(),
        html = converter.makeHtml(entry.brief);

    jsdom.env({
        html: '<foo>' + html + '</foo>', // empty and HTML tags throw for some obscure reason.
        scripts: [config.jQuery.local],
        done: function(err,window){
            if(err){
                done(err);
                return;
            }
            var $ = window.$,
                plain = $(':root').text();

            done(null,plain);
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
    search: search,
    tagged: tagged,
    getPlainTextBrief: getPlainTextBrief
};