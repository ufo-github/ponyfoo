var async = require('async'),
    $ = require('./$.js'),
    rest = require('./rest.js');

function getCallback(opts){
    if(opts !== undefined){
        if(opts.res !== undefined){
            return function(err){
                opts.args = $.args(arguments).slice(1);
                rest.resHandler(err, opts);
            };
        }else if(opts.then !== undefined){
            return opts.then;
        }
    }
    return $.log.err;
}

function crud(model){
    function create(source, opts){
        var document,
            callback = getCallback(opts);

        document = new model(source);
        (opts.always || $.noop)(document);
        document.save(callback);
    }

    function update(query, document, opts){
        var callback = getCallback(opts);

        (opts.always || $.noop)(document);
        model.findOneAndUpdate(query, document, {}, callback);
    }

    function remove(query, opts){
        var callback = getCallback(opts);

        model.remove(query, callback);
    }

    function list(opts,done){
        var page = parseInt(opts.page || 1),
            lim = opts.limit,
            index = (page-1) * lim,
            where = model.find(opts.query || {});

        async.parallel({
            documents: function(cb){
                where.sort(opts.sort).skip(index).limit(lim).exec(function(err, documents){
                    if(err){
                        cb(err);
                        return;
                    }
                    if (opts.mapper){
                        opts.mapper(documents, cb);
                    }else{
                        cb(null, documents);
                    }
                });
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
        }, function(err,results){
            if (results.documents && opts.listName){
                results[opts.listName] = results.documents;
                delete results.documents;
            }
            done(err,results);
        });
    }

    var http = {
        remove: function(req,res){
            remove({ _id: req.params.id }, {
                res: res
            });
        }
    };

    return {
        create: create,
        update: update,
        remove: remove,
        list: list,
        http: http
    }
}

module.exports = crud;