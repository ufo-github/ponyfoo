var $ = require('./$.js'),
    rest = require('./rest.js');

function defaultCallback(opts){
    if(!!opts && !!opts.res){
        return function(err){
            rest.resHandler(err, opts.res);
        }
    }
    return $.log.err;
}

function crud(model){
    function create(source, opts){
        var document,
            callback = opts.then ||  defaultCallback(opts);

        document = new model(source);
        (opts.always || $.noop)(document);
        document.save(callback);
    }

    function update(query, document, opts){
        var callback = opts.then ||  defaultCallback(opts);

        (opts.always || $.noop)(document);
        model.findOneAndUpdate(query, document, {}, callback);
    }

    function remove(query, opts){
        var callback = opts.then || defaultCallback(opts);

        model.remove(query, callback);
    }

    return {
        create: create,
        update: update,
        remove: remove
    }
}

module.exports = crud;